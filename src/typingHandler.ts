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
            if (!this.isEnabled) {
                return;
            }
            
            // Only process single character changes
            if (event.contentChanges.length !== 1) {
                return;
            }
            
            const change = event.contentChanges[0];
            
            // Only process when '}' is typed (completing ${})
            if (change.text !== '}') {
                return;
            }
            
            // Check if the change is preceded by '${'
            const document = event.document;
            const position = change.range.start;
            
            // Look back 2 characters to see if we have '${'
            const beforeText = document.getText(new vscode.Range(
                new vscode.Position(position.line, Math.max(0, position.character - 2)),
                position
            ));
            
            if (!beforeText.endsWith('${')) {
                return;
            }
            
            // Check if we're in a supported language
            if (!this.isSupportedLanguage(document.languageId)) {
                return;
            }
            
            // Find the quote range
            const quoteRange = QuoteConverter.findQuoteRange(document, position);
            if (!quoteRange) {
                return;
            }
            
            // Check if string contains backticks (skip if true)
            if (QuoteConverter.hasBackticks(quoteRange.content)) {
                return;
            }
            
            // Check if in valid context
            if (!QuoteConverter.isValidContext(document, quoteRange.start)) {
                return;
            }
            
            // Perform the conversion
            this.convertQuotesToBackticks(document, quoteRange);
        });
        
        this.disposables.push(disposable);
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
