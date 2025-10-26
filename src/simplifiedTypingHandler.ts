import * as vscode from 'vscode';
import { JSXBacktickConverter } from './jsxBacktickConverter';

/**
 * Simplified Typing Handler for JSX Backtick Conversion
 * Focuses specifically on the backtick-to-brace conversion use case
 */
export class SimplifiedTypingHandler {
    private disposables: vscode.Disposable[] = [];
    private isEnabled: boolean = true;
    
    constructor() {
        this.setupDocumentChangeListener();
        this.setupConfigurationListener();
    }
    
    private setupDocumentChangeListener(): void {
        const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
            if (!this.isEnabled) {
                return;
            }
            
            // Check if we're in a supported language
            const document = event.document;
            if (!JSXBacktickConverter.isJSXSupportedLanguage(document.languageId)) {
                return;
            }
            
            // Process all changes
            for (const change of event.contentChanges) {
                const position = change.range.start;
                
                // Handle backtick to brace conversion when typing } inside backticks
                if (JSXBacktickConverter.shouldTriggerConversion(document, position, change.text)) {
                    console.log('JSX Backtick Converter: Triggering conversion for character:', change.text);
                    
                    // Use a timeout to allow the document to settle
                    setTimeout(() => {
                        this.performConversion(document, position);
                    }, 50);
                    continue;
                }
                
                // Handle automatic wrapping when typing } after ${ pattern in backticks
                if (change.text === '}') {
                    this.handleBraceCompletionInBackticks(document, position);
                }
            }
        });
        
        this.disposables.push(disposable);
    }
    
    /**
     * Handle automatic wrapping of backticks with braces when interpolation is detected
     */
    private handleBraceCompletionInBackticks(document: vscode.TextDocument, position: vscode.Position): void {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }

            const line = document.lineAt(position.line);
            const lineText = line.text;
            
            // Find the nearest backtick before the just-typed } character
            const textBeforeBrace = lineText.substring(0, position.character - 1);
            const backtickBeforeIndex = textBeforeBrace.lastIndexOf('`');
            if (backtickBeforeIndex === -1) {
                return;
            }
            
            // Find the nearest backtick after the just-typed } character
            const textAfterBrace = lineText.substring(position.character);
            const backtickAfterIndex = textAfterBrace.indexOf('`');
            if (backtickAfterIndex === -1) {
                return;
            }
            
            // Get the content between backticks
            const contentStart = backtickBeforeIndex + 1;
            const contentEnd = position.character - 1 + backtickAfterIndex;
            const fullContent = lineText.substring(contentStart, contentEnd);
            
            // Check if content has interpolation pattern ${...}
            if (!/\$\{[^}]*\}/.test(fullContent)) {
                return;
            }
            
            // Verify this is a JSX attribute: look for attribute name and = before the backtick
            const beforeBacktick = lineText.substring(0, backtickBeforeIndex);
            
            // Find the attribute name before the backtick
            const attributeMatch = beforeBacktick.match(/(\w+)\s*=\s*$/);
            if (!attributeMatch) {
                return;
            }
            
            // Verify we're in a JSX context (look for < before the attribute)
            const beforeAttribute = beforeBacktick.substring(0, beforeBacktick.length - attributeMatch[0].length);
            const jsxTagMatch = beforeAttribute.match(/<[A-Za-z][A-Za-z0-9]*\s*[^>]*$/);
            if (!jsxTagMatch) {
                return;
            }
            
            // Check if already wrapped in braces
            const charBeforeBacktick = backtickBeforeIndex > 0 ? lineText.charAt(backtickBeforeIndex - 1) : ' ';
            if (charBeforeBacktick === '{') {
                return; // Already wrapped
            }
            
            // Check if we're inside quotes
            if (this.isInStringLiteral(lineText, backtickBeforeIndex)) {
                return;
            }
            
            // Wrap with braces
            const edit = new vscode.WorkspaceEdit();
            
            // Insert opening brace before the backtick
            edit.insert(
                document.uri,
                new vscode.Position(position.line, backtickBeforeIndex),
                '{'
            );
            
            // Insert closing brace after the last backtick (need to add 1 because we're inserting after)
            edit.insert(
                document.uri,
                new vscode.Position(position.line, position.character + backtickAfterIndex + 1),
                '}'
            );
            
            vscode.workspace.applyEdit(edit).then(success => {
                if (success) {
                    console.log('Automatically wrapped backticks with braces');
                    
                    // Move cursor to after the closing brace
                    setTimeout(() => {
                        const finalPosition = new vscode.Position(
                            position.line, 
                            position.character + backtickAfterIndex + 2
                        );
                        editor.selection = new vscode.Selection(finalPosition, finalPosition);
                    }, 50);
                }
            });
        } catch (error) {
            console.error('Error handling brace completion:', error);
        }
    }
    
    /**
     * Check if a position is inside a string literal
     */
    private isInStringLiteral(lineText: string, index: number): boolean {
        let inSingleQuote = false;
        let inDoubleQuote = false;

        for (let i = 0; i < index; i++) {
            if (lineText[i] === "'" && (i === 0 || lineText[i - 1] !== "\\")) {
                inSingleQuote = !inSingleQuote;
            } else if (lineText[i] === '"' && (i === 0 || lineText[i - 1] !== "\\")) {
                inDoubleQuote = !inDoubleQuote;
            }
        }
        
        return inSingleQuote || inDoubleQuote;
    }
    
    private async performConversion(document: vscode.TextDocument, position: vscode.Position): Promise<void> {
        try {
            const edit = JSXBacktickConverter.convertBackticksToBraces(document, position);
            
            if (edit) {
                const success = await vscode.workspace.applyEdit(edit);
                
                if (success) {
                    console.log('JSX Backtick Converter: Successfully converted backticks to braces');
                    
                    const config = vscode.workspace.getConfiguration('quotick');
                    const showNotifications = config.get('showNotifications', true);
                    
                    if (showNotifications) {
                        vscode.window.showInformationMessage(
                            'Quotick: Converted JSX backticks to braces',
                            'OK'
                        );
                    }
                } else {
                    console.error('JSX Backtick Converter: Failed to apply edit');
                }
            }
        } catch (error) {
            console.error('JSX Backtick Converter: Error during conversion:', error);
        }
    }
    
    private setupConfigurationListener(): void {
        const disposable = vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('quotick.enableAutoConvert')) {
                const config = vscode.workspace.getConfiguration('quotick');
                this.isEnabled = config.get('enableAutoConvert', true);
            }
        });
        
        this.disposables.push(disposable);
        
        // Initialize from current configuration
        const config = vscode.workspace.getConfiguration('quotick');
        this.isEnabled = config.get('enableAutoConvert', true);
    }
    
    public toggleAutoConvert(): void {
        this.isEnabled = !this.isEnabled;
        const config = vscode.workspace.getConfiguration('quotick');
        config.update('enableAutoConvert', this.isEnabled, vscode.ConfigurationTarget.Global);
        
        vscode.window.showInformationMessage(
            `Quotick auto-convert ${this.isEnabled ? 'enabled' : 'disabled'}`,
            'OK'
        );
    }
    
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}
