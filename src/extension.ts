import * as vscode from 'vscode';
import { DocumentChangeHandler } from './documentChangeHandler';
import { ConfigurationManager } from './configuration';
import { QuoteConverter } from './converter';

let documentChangeHandler: DocumentChangeHandler;

export function activate(context: vscode.ExtensionContext) {
    console.log('QuickTick extension is now active!');
    
    // Initialize document change handler for auto-conversion
    documentChangeHandler = new DocumentChangeHandler();
    
    // Register toggle command
    const toggleAutoConvertCommand = vscode.commands.registerCommand('quicktick.toggleAutoConvert', () => {
        toggleAutoConvert();
    });
    
    // Add a test command to manually trigger conversion
    const testCommand = vscode.commands.registerCommand('quicktick.test', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        
        processDocumentForTemplateLiterals(editor.document);
    });
    
    // Add commands to context
    context.subscriptions.push(toggleAutoConvertCommand);
    context.subscriptions.push(testCommand);
    context.subscriptions.push(documentChangeHandler);
    
    // Show welcome message
    showWelcomeMessage();
}

export function deactivate() {
    if (documentChangeHandler) {
        documentChangeHandler.dispose();
    }
}

async function toggleAutoConvert(): Promise<void> {
    const config = ConfigurationManager.getConfiguration();
    const newEnabled = !config.enabled;
    
    await ConfigurationManager.updateConfiguration('enableAutoConvert', newEnabled);
    
    vscode.window.showInformationMessage(
        `QuickTick auto-convert ${newEnabled ? 'enabled' : 'disabled'}`,
        'OK'
    );
}

async function processDocumentForTemplateLiterals(document: vscode.TextDocument): Promise<void> {
    try {
        console.log('Processing document for template literals...');
        
        // Find all template literals in quotes
        const templateLiterals = QuoteConverter.findAllTemplateLiterals(document);
        console.log('Found', templateLiterals.length, 'template literals');
        
        // Find the most recent one (the one that was just typed)
        let targetLiteral = null;
        for (const templateLiteral of templateLiterals) {
            console.log('Checking template literal:', templateLiteral.content);
            
            // Check if string contains backticks (skip if true)
            if (templateLiteral.content.includes('`')) {
                console.log('Skipping - contains backticks');
                continue;
            }
            
            // Check if in valid context
            if (!templateLiteral.isValidContext) {
                console.log('Skipping - invalid context');
                continue;
            }
            
            // This is a valid candidate
            targetLiteral = templateLiteral;
        }
        
        if (targetLiteral) {
            console.log('Converting quotes to backticks for:', targetLiteral.content);
            
            // Create a quote range for conversion
            const quoteRange = {
                start: targetLiteral.start,
                end: targetLiteral.end,
                quoteType: '"' as const, // We'll determine this from the actual content
                content: targetLiteral.content,
                lineNumber: targetLiteral.start.line
            };
            
            const result = QuoteConverter.convertToBackticks(document, quoteRange);
            if (result.success) {
                await QuoteConverter.applyConversion(result);
                vscode.window.showInformationMessage('Converted quotes to backticks', 'OK');
            } else {
                vscode.window.showErrorMessage(`Failed to convert: ${result.error}`, 'OK');
            }
        } else {
            console.log('No valid template literal found to convert');
            vscode.window.showInformationMessage('No template literals found to convert', 'OK');
        }
    } catch (error) {
        console.error('Error processing document:', error);
        vscode.window.showErrorMessage(`Error processing document: ${error}`, 'OK');
    }
}

function showWelcomeMessage(): void {
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
