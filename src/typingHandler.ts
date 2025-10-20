import * as vscode from 'vscode';
import { QuoteConverter } from './converter';

export class TypingHandler {
    private disposables: vscode.Disposable[] = [];
    private isEnabled: boolean = true;
    
    constructor() {
        this.setupDocumentChangeListener();
        this.setupConfigurationListener();
    }
    
    private setupDocumentChangeListener(): void {
        const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
            console.log('QuickTick: Document changed');
            
            if (!this.isEnabled) {
                console.log('QuickTick: Auto-convert disabled');
                return;
            }
            
            // Check if we're in a supported language
            const document = event.document;
            if (!this.isSupportedLanguage(document.languageId)) {
                console.log('QuickTick: Unsupported language:', document.languageId);
                return;
            }
            
            // Only process single character changes
            if (event.contentChanges.length !== 1) {
                console.log('QuickTick: Multiple changes, skipping');
                return;
            }
            
            const change = event.contentChanges[0];
            console.log('QuickTick: Processing change:', change.text);
            
            // Only process when '}' is typed (completing ${})
            if (change.text !== '}') {
                console.log('QuickTick: Not a closing brace, skipping');
                return;
            }
            
            // Check if the change is preceded by '${'
            const position = change.range.start;
            // Look at more text to find the ${} pattern
            const beforeText = document.getText(new vscode.Range(
                new vscode.Position(position.line, Math.max(0, position.character - 10)),
                new vscode.Position(position.line, position.character)
            ));
            
            console.log('QuickTick: Checking text before cursor:', beforeText);
            
            // Check if the text contains '${...}' pattern (template literal)
            if (!/\$\{[^}]*\}/.test(beforeText)) {
                console.log('QuickTick: No template literal pattern found, skipping');
                return;
            }
            
            console.log('QuickTick: Found template literal pattern, checking quote range...');
            
            // Use a timeout to allow the document to settle
            setTimeout(() => {
                this.processDocumentForTemplateLiterals(document);
            }, 50);
        });
        
        this.disposables.push(disposable);
    }
    
    public async processDocumentForTemplateLiterals(document: vscode.TextDocument): Promise<void> {
        try {
            console.log('QuickTick: Processing document for template literals...');
            
            // Find all template literals in quotes
            const templateLiterals = QuoteConverter.findAllTemplateLiterals(document);
            console.log('QuickTick: Found', templateLiterals.length, 'template literals');
            
            // Find the most recent one (the one that was just typed)
            let targetLiteral = null;
            for (const templateLiteral of templateLiterals) {
                console.log('QuickTick: Checking template literal:', templateLiteral.content);
                
                // Check if string contains backticks (skip if true)
                if (QuoteConverter.hasBackticks(templateLiteral.content)) {
                    console.log('QuickTick: Skipping - contains backticks');
                    continue;
                }
                
                // Check if in valid context
                if (!QuoteConverter.isValidContext(document, templateLiteral.start)) {
                    console.log('QuickTick: Skipping - invalid context');
                    continue;
                }
                
                // This is a valid candidate
                targetLiteral = templateLiteral;
            }
            
            if (targetLiteral) {
                console.log('QuickTick: Converting quotes to backticks for:', targetLiteral.content);
                await this.convertQuotesToBackticks(document, targetLiteral);
            } else {
                console.log('QuickTick: No valid template literal found to convert');
            }
        } catch (error) {
            console.error('QuickTick: Error processing document:', error);
        }
    }
    
    private setupConfigurationListener(): void {
        const disposable = vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('quicktick.enableAutoConvert')) {
                const config = vscode.workspace.getConfiguration('quicktick');
                this.isEnabled = config.get('enableAutoConvert', true);
            }
        });
        
        this.disposables.push(disposable);
        
        // Initialize from current configuration
        const config = vscode.workspace.getConfiguration('quicktick');
        this.isEnabled = config.get('enableAutoConvert', true);
    }
    
    private isSupportedLanguage(languageId: string): boolean {
        const config = vscode.workspace.getConfiguration('quicktick');
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
            const edit = QuoteConverter.convertToBacktick(document, quoteRange);
            
            // Apply the edit with better error handling
            const success = await vscode.workspace.applyEdit(edit);
            
            if (success) {
                const config = vscode.workspace.getConfiguration('quicktick');
                const showNotifications = config.get('showNotifications', true);
                
                if (showNotifications) {
                    vscode.window.showInformationMessage(
                        'QuickTick: Converted quotes to backticks',
                        'OK'
                    );
                }
            } else {
                console.error('QuickTick: Failed to apply edit');
            }
        } catch (error) {
            console.error('QuickTick conversion error:', error);
        }
    }
    
    public toggleAutoConvert(): void {
        this.isEnabled = !this.isEnabled;
        const config = vscode.workspace.getConfiguration('quicktick');
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
