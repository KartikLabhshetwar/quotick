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
            
            // Only process single character changes
            if (event.contentChanges.length !== 1) {
                return;
            }
            
            const change = event.contentChanges[0];
            const position = change.range.start;
            
            // Check if we should trigger conversion
            if (JSXBacktickConverter.shouldTriggerConversion(document, position, change.text)) {
                console.log('JSX Backtick Converter: Triggering conversion for character:', change.text);
                
                // Use a timeout to allow the document to settle
                setTimeout(() => {
                    this.performConversion(document, position);
                }, 50);
            }
        });
        
        this.disposables.push(disposable);
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
