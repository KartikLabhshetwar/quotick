import * as vscode from 'vscode';
import { QuoteConverter } from './converter';

export class Scanner {
    /**
     * Scan and convert existing template literals in the current document
     */
    static async scanCurrentDocument(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        
        const document = editor.document;
        
        // Check if we're in a supported language
        if (!this.isSupportedLanguage(document.languageId)) {
            vscode.window.showWarningMessage(
                `QuickTick: ${document.languageId} is not supported. Supported languages: JavaScript, TypeScript, JSX, TSX`
            );
            return;
        }
        
        try {
            const templateLiterals = QuoteConverter.findAllTemplateLiterals(document);
            
            if (templateLiterals.length === 0) {
                vscode.window.showInformationMessage('QuickTick: No template literals found to convert');
                return;
            }
            
            // Show confirmation dialog
            const action = await vscode.window.showInformationMessage(
                `QuickTick: Found ${templateLiterals.length} template literal(s) to convert. Proceed?`,
                'Convert All',
                'Preview',
                'Cancel'
            );
            
            if (action === 'Cancel') {
                return;
            }
            
            if (action === 'Preview') {
                this.previewConversions(document, templateLiterals);
                return;
            }
            
            // Perform conversions
            await this.performConversions(document, templateLiterals);
            
        } catch (error) {
            console.error('QuickTick scan error:', error);
            vscode.window.showErrorMessage('QuickTick: Error scanning document');
        }
    }
    
    /**
     * Scan and convert existing template literals in the workspace
     */
    static async scanWorkspace(): Promise<void> {
        const config = vscode.workspace.getConfiguration('quicktick');
        const supportedLanguages = config.get<string[]>('supportedLanguages', [
            'javascript',
            'typescript',
            'javascriptreact',
            'typescriptreact'
        ]);
        
        const files = await vscode.workspace.findFiles(
            `**/*.{js,ts,jsx,tsx}`,
            '**/node_modules/**'
        );
        
        if (files.length === 0) {
            vscode.window.showInformationMessage('QuickTick: No supported files found in workspace');
            return;
        }
        
        let totalConversions = 0;
        const fileResults: Array<{ file: vscode.Uri; count: number }> = [];
        
        // Process each file
        for (const file of files) {
            try {
                const document = await vscode.workspace.openTextDocument(file);
                const templateLiterals = QuoteConverter.findAllTemplateLiterals(document);
                
                if (templateLiterals.length > 0) {
                    fileResults.push({ file, count: templateLiterals.length });
                    totalConversions += templateLiterals.length;
                }
            } catch (error) {
                console.error(`Error processing file ${file.fsPath}:`, error);
            }
        }
        
        if (totalConversions === 0) {
            vscode.window.showInformationMessage('QuickTick: No template literals found in workspace');
            return;
        }
        
        // Show summary and confirmation
        const fileList = fileResults
            .map(f => `${vscode.workspace.asRelativePath(f.file)} (${f.count})`)
            .join('\n');
        
        const action = await vscode.window.showInformationMessage(
            `QuickTick: Found ${totalConversions} template literal(s) in ${fileResults.length} file(s):\n\n${fileList}\n\nProceed with conversion?`,
            'Convert All',
            'Cancel'
        );
        
        if (action === 'Cancel') {
            return;
        }
        
        // Perform conversions
        for (const fileResult of fileResults) {
            try {
                const document = await vscode.workspace.openTextDocument(fileResult.file);
                const templateLiterals = QuoteConverter.findAllTemplateLiterals(document);
                await this.performConversions(document, templateLiterals);
            } catch (error) {
                console.error(`Error converting file ${fileResult.file.fsPath}:`, error);
            }
        }
        
        vscode.window.showInformationMessage(
            `QuickTick: Successfully converted ${totalConversions} template literal(s)`
        );
    }
    
    private static isSupportedLanguage(languageId: string): boolean {
        const supportedLanguages = [
            'javascript',
            'typescript',
            'javascriptreact',
            'typescriptreact'
        ];
        
        return supportedLanguages.includes(languageId);
    }
    
    private static async previewConversions(document: vscode.TextDocument, templateLiterals: any[]): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        
        // Create a new document with preview
        const originalText = document.getText();
        let previewText = originalText;
        
        // Apply conversions in reverse order to maintain positions
        for (let i = templateLiterals.length - 1; i >= 0; i--) {
            const literal = templateLiterals[i];
            const startOffset = document.offsetAt(literal.start);
            const endOffset = document.offsetAt(literal.end);
            
            previewText = previewText.substring(0, startOffset) + '`' +
                         previewText.substring(startOffset + 1, endOffset) + '`' +
                         previewText.substring(endOffset + 1);
        }
        
        // Show diff
        const diffDoc = await vscode.workspace.openTextDocument({
            content: previewText,
            language: document.languageId
        });
        
        await vscode.window.showTextDocument(diffDoc, { viewColumn: vscode.ViewColumn.Beside });
        
        vscode.window.showInformationMessage(
            `QuickTick: Preview showing ${templateLiterals.length} conversion(s). Apply changes?`,
            'Apply',
            'Cancel'
        ).then(action => {
            if (action === 'Apply') {
                this.performConversions(document, templateLiterals);
            }
        });
    }
    
    private static async performConversions(document: vscode.TextDocument, templateLiterals: any[]): Promise<void> {
        const edit = new vscode.WorkspaceEdit();
        
        // Apply conversions in reverse order to maintain positions
        for (let i = templateLiterals.length - 1; i >= 0; i--) {
            const literal = templateLiterals[i];
            const conversionEdit = QuoteConverter.convertToBacktick(document, literal);
            
            // Merge edits
            for (const [uri, textEdits] of conversionEdit.entries()) {
                if (!edit.has(uri)) {
                    edit.set(uri, []);
                }
                edit.get(uri)!.push(...textEdits);
            }
        }
        
        const success = await vscode.workspace.applyEdit(edit);
        
        if (success) {
            const config = vscode.workspace.getConfiguration('quicktick');
            const showNotifications = config.get('showNotifications', true);
            
            if (showNotifications) {
                vscode.window.showInformationMessage(
                    `QuickTick: Successfully converted ${templateLiterals.length} template literal(s)`
                );
            }
        } else {
            vscode.window.showErrorMessage('QuickTick: Failed to apply conversions');
        }
    }
}
