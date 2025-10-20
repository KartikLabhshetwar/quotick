import * as vscode from 'vscode';
import { TypingHandler } from './typingHandler';

let typingHandler: TypingHandler;

export function activate(context: vscode.ExtensionContext) {
    console.log('QuickTick extension is now active!');
    
    // Initialize typing handler for auto-conversion
    typingHandler = new TypingHandler();
    
    // Register only the toggle command
    const toggleAutoConvertCommand = vscode.commands.registerCommand('quicktick.toggleAutoConvert', () => {
        typingHandler.toggleAutoConvert();
    });
    
    // Add a test command to manually trigger conversion
    const testCommand = vscode.commands.registerCommand('quicktick.test', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        
        typingHandler.processDocumentForTemplateLiterals(editor.document);
    });
    
    // Add commands to context
    context.subscriptions.push(toggleAutoConvertCommand);
    context.subscriptions.push(testCommand);
    context.subscriptions.push(typingHandler);
    
    // Show welcome message
    const config = vscode.workspace.getConfiguration('quicktick');
    const showWelcome = config.get('showWelcomeMessage', true);
    
    if (showWelcome) {
        vscode.window.showInformationMessage(
            'QuickTick: Auto-conversion enabled! Type `${}` in quotes to convert to backticks.',
            'Got it!'
        ).then(() => {
            config.update('showWelcomeMessage', false, vscode.ConfigurationTarget.Global);
        });
    }
}

export function deactivate() {
    if (typingHandler) {
        typingHandler.dispose();
    }
}
