import * as vscode from 'vscode';
import { TypingHandler } from './typingHandler';
import { Scanner } from './scanner';

let typingHandler: TypingHandler;

export function activate(context: vscode.ExtensionContext) {
    console.log('QuickTick extension is now active!');
    
    // Initialize typing handler
    typingHandler = new TypingHandler();
    
    // Register commands
    const convertExistingCommand = vscode.commands.registerCommand('quicktick.convertExisting', () => {
        Scanner.scanCurrentDocument();
    });
    
    const convertWorkspaceCommand = vscode.commands.registerCommand('quicktick.convertWorkspace', () => {
        Scanner.scanWorkspace();
    });
    
    const toggleAutoConvertCommand = vscode.commands.registerCommand('quicktick.toggleAutoConvert', () => {
        typingHandler.toggleAutoConvert();
    });
    
    // Add commands to context
    context.subscriptions.push(convertExistingCommand);
    context.subscriptions.push(convertWorkspaceCommand);
    context.subscriptions.push(toggleAutoConvertCommand);
    context.subscriptions.push(typingHandler);
    
    // Show welcome message
    const config = vscode.workspace.getConfiguration('quicktick');
    const showWelcome = config.get('showWelcomeMessage', true);
    
    if (showWelcome) {
        vscode.window.showInformationMessage(
            'QuickTick: Template Literal Converter activated! Type `${}` in quotes to auto-convert.',
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
