import * as vscode from 'vscode';
import { QuoteConverter } from './converter';
import { TemplateLiteralDetector } from './templateLiteralDetector';
import { AttributeHandler } from './attributeHandler';
import { JSXDetector } from './jsxDetector';

export class TypingHandler {
    private disposables: vscode.Disposable[] = [];
    private isEnabled: boolean = true;
    
    constructor() {
        this.setupDocumentChangeListener();
        this.setupConfigurationListener();
    }
    
    private setupDocumentChangeListener(): void {
        const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
            console.log('Quotick: Document changed');
            
            if (!this.isEnabled) {
                console.log('Quotick: Auto-convert disabled');
                return;
            }
            
            // Check if we're in a supported language
            const document = event.document;
            if (!this.isSupportedLanguage(document.languageId)) {
                console.log('Quotick: Unsupported language:', document.languageId);
                return;
            }
            
            // Only process single character changes
            if (event.contentChanges.length !== 1) {
                console.log('Quotick: Multiple changes, skipping');
                return;
            }
            
            const change = event.contentChanges[0];
            console.log('Quotick: Processing change:', change.text);
            
            const position = change.range.start;
            
            // Check if we're in JSX context and should handle JSX attribute conversion
            if (JSXDetector.isJSXSupportedLanguage(document.languageId)) {
                console.log('Quotick: JSX context detected, checking for attribute conversion...');
                
                // Check for JSX attribute conversion on various triggers
                const jsxResult = this.handleJSXAttributeConversion(document, position, change.text);
                if (jsxResult && jsxResult.success) {
                    console.log('Quotick: JSX attribute conversion triggered');
                    setTimeout(() => {
                        this.applyConversion(jsxResult);
                    }, 50);
                    return;
                }
            }
            
            // Only process when '}' is typed (completing ${}) for regular template literals
            if (change.text !== '}') {
                console.log('Quotick: Not a closing brace, skipping');
                return;
            }
            
            // Check if the change is preceded by '${'
            // Look at more text to find the ${} pattern
            const beforeText = document.getText(new vscode.Range(
                new vscode.Position(position.line, Math.max(0, position.character - 10)),
                new vscode.Position(position.line, position.character)
            ));
            
            console.log('Quotick: Checking text before cursor:', beforeText);
            
            // Check if the text contains '${...}' pattern (template literal)
            if (!/\$\{[^}]*\}/.test(beforeText)) {
                console.log('Quotick: No template literal pattern found, skipping');
                return;
            }
            
            console.log('Quotick: Found template literal pattern, checking quote range...');
            
            // Use a timeout to allow the document to settle
            setTimeout(() => {
                this.processDocumentForTemplateLiterals(document);
            }, 50);
        });
        
        this.disposables.push(disposable);
    }
    
    public async processDocumentForTemplateLiterals(document: vscode.TextDocument): Promise<void> {
        try {
            console.log('Quotick: Processing document for template literals...');
            
            // Find all template literals in quotes
            const templateLiterals = QuoteConverter.findAllTemplateLiterals(document);
            console.log('Quotick: Found', templateLiterals.length, 'template literals');
            
            // Find the most recent one (the one that was just typed)
            let targetLiteral = null;
            for (const templateLiteral of templateLiterals) {
                console.log('Quotick: Checking template literal:', templateLiteral.content);
                
                // Check if string contains backticks (skip if true)
                if (TemplateLiteralDetector.hasBackticks(templateLiteral.content)) {
                    console.log('Quotick: Skipping - contains backticks');
                    continue;
                }
                
                // Check if in valid context
                if (!TemplateLiteralDetector.isValidContext(document, templateLiteral.start)) {
                    console.log('Quotick: Skipping - invalid context');
                    continue;
                }
                
                // This is a valid candidate
                targetLiteral = templateLiteral;
            }
            
            if (targetLiteral) {
                console.log('Quotick: Converting quotes to backticks for:', targetLiteral.content);
                await this.convertQuotesToBackticks(document, targetLiteral);
            } else {
                console.log('Quotick: No valid template literal found to convert');
            }
        } catch (error) {
            console.error('Quotick: Error processing document:', error);
        }
    }
    
    private setupConfigurationListener(): void {
        const disposable = vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('quicktick.enableAutoConvert')) {
                const config = vscode.workspace.getConfiguration('quotick');
                this.isEnabled = config.get('enableAutoConvert', true);
            }
        });
        
        this.disposables.push(disposable);
        
        // Initialize from current configuration
        const config = vscode.workspace.getConfiguration('quotick');
        this.isEnabled = config.get('enableAutoConvert', true);
    }
    
    private isSupportedLanguage(languageId: string): boolean {
        const config = vscode.workspace.getConfiguration('quotick');
        const supportedLanguages = config.get<string[]>('supportedLanguages', [
            'javascript',
            'typescript',
            'javascriptreact',
            'typescriptreact'
        ]);
        
        return supportedLanguages.includes(languageId);
    }
    
    private async convertQuotesToBackticks(document: vscode.TextDocument, quoteRange: any): Promise<void> {
        try {
            const result = QuoteConverter.convertToBackticks(document, quoteRange);
            
            if (result.success && result.edit) {
                // Apply the edit with better error handling
                const success = await vscode.workspace.applyEdit(result.edit);
                
                if (success) {
                    const config = vscode.workspace.getConfiguration('quotick');
                    const showNotifications = config.get('showNotifications', true);
                    
                    if (showNotifications) {
                        vscode.window.showInformationMessage(
                            'Quotick: Converted quotes to backticks',
                            'OK'
                        );
                    }
                } else {
                    console.error('Quotick: Failed to apply edit');
                }
            } else {
                console.error('Quotick: Conversion failed:', result.error);
            }
        } catch (error) {
            console.error('QuickTick conversion error:', error);
        }
    }
    
    private async applyConversion(result: any): Promise<void> {
        try {
            if (result.success && result.edit) {
                const success = await vscode.workspace.applyEdit(result.edit);
                
                if (success) {
                    const config = vscode.workspace.getConfiguration('quotick');
                    const showNotifications = config.get('showNotifications', true);
                    
                    if (showNotifications) {
                        vscode.window.showInformationMessage(
                            'Quotick: JSX attribute converted',
                            'OK'
                        );
                    }
                } else {
                    console.error('Quotick: Failed to apply JSX conversion');
                }
            } else {
                console.error('Quotick: JSX conversion failed:', result.error);
            }
        } catch (error) {
            console.error('Quotick JSX conversion error:', error);
        }
    }
    
    private handleJSXAttributeConversion(document: vscode.TextDocument, position: vscode.Position, typedCharacter: string): any {
        console.log('Handling JSX attribute conversion:', {
            typedCharacter,
            position: `${position.line}:${position.character}`,
            languageId: document.languageId
        });
        
        // Check if we're in a JSX attribute context
        const attributeInfo = JSXDetector.getJSXAttributeInfo(document, position);
        if (!attributeInfo) {
            console.log('No JSX attribute info found');
            return null;
        }
        
        console.log('Found JSX attribute:', {
            attributeName: attributeInfo.attributeName,
            attributeValue: attributeInfo.attributeValue,
            hasInterpolation: attributeInfo.hasInterpolation,
            isWrappedInBackticks: attributeInfo.isWrappedInBackticks,
            isWrappedInBraces: attributeInfo.isWrappedInBraces
        });
        
        // Check if we're typing inside backticks with interpolation
        if (attributeInfo.isWrappedInBackticks && attributeInfo.hasInterpolation) {
            // Trigger conversion when typing ${ or } inside backticks
            if (typedCharacter === '{' || typedCharacter === '}') {
                console.log('Triggering conversion for backtick attribute');
                return AttributeHandler.handleJSXAttributeConversion(document, position, typedCharacter);
            }
        }
        
        // Check if we're typing ${ inside quotes
        if (!attributeInfo.isWrappedInBackticks && !attributeInfo.isWrappedInBraces) {
            const line = document.lineAt(position.line);
            const text = line.text;
            const charIndex = position.character;
            
            // Check if we just typed ${ 
            if (typedCharacter === '{') {
                const beforeText = text.substring(Math.max(0, charIndex - 2), charIndex);
                if (beforeText === '${') {
                    console.log('Triggering conversion for quote attribute');
                    return AttributeHandler.handleJSXAttributeConversion(document, position, typedCharacter);
                }
            }
        }
        
        return null;
    }
    
    public toggleAutoConvert(): void {
        this.isEnabled = !this.isEnabled;
        const config = vscode.workspace.getConfiguration('quotick');
        config.update('enableAutoConvert', this.isEnabled, vscode.ConfigurationTarget.Global);
        
        vscode.window.showInformationMessage(
            `QuickTick auto-convert ${this.isEnabled ? 'enabled' : 'disabled'}`,
            'OK'
        );
    }
    
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}
