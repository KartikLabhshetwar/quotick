import * as vscode from 'vscode';
import { DocumentChangeHandler } from './documentChangeHandler';
import { ConfigurationManager } from './configuration';
import { QuoteConverter } from './converter';
import { JSXDetector } from './jsxDetector';
import { JSXBacktickConverter } from './jsxBacktickConverter';
import { SimplifiedTypingHandler } from './simplifiedTypingHandler';

let documentChangeHandler: DocumentChangeHandler;
let simplifiedTypingHandler: SimplifiedTypingHandler;

export function activate(context: vscode.ExtensionContext) {
    console.log('Quotick extension is now active!');
    
    // Initialize document change handler for auto-conversion
    documentChangeHandler = new DocumentChangeHandler();
    
    // Initialize simplified typing handler for JSX backtick conversion
    simplifiedTypingHandler = new SimplifiedTypingHandler();
    
    // Register toggle command
    const toggleAutoConvertCommand = vscode.commands.registerCommand('quotick.toggleAutoConvert', () => {
        toggleAutoConvert();
    });
    
    // Add a test command to manually trigger conversion
    const testCommand = vscode.commands.registerCommand('quotick.test', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        
        processDocumentForTemplateLiterals(editor.document);
    });
    
    // Add toggle revert feature command
    const toggleRevertCommand = vscode.commands.registerCommand('quotick.toggleRevertFeature', () => {
        toggleRevertFeature();
    });
    
    // Add explicit enable/disable extension commands
    const enableExtensionCommand = vscode.commands.registerCommand('quotick.enableExtension', () => {
        setExtensionEnabled(true);
    });
    const disableExtensionCommand = vscode.commands.registerCommand('quotick.disableExtension', () => {
        setExtensionEnabled(false);
    });
    
    // Add JSX attribute wrapping command
    const wrapJSXAttributesCommand = vscode.commands.registerCommand('quotick.wrapJSXAttributes', () => {
        wrapJSXAttributes();
    });
    
    // Add debug JSX detection command
    const debugJSXDetectionCommand = vscode.commands.registerCommand('quotick.debugJSXDetection', () => {
        debugJSXDetection();
    });
    
    // Add test JSX backtick conversion command
    const testJSXBacktickCommand = vscode.commands.registerCommand('quotick.testJSXBacktickConversion', () => {
        testJSXBacktickConversion();
    });
    
    // Add commands to context
    context.subscriptions.push(toggleAutoConvertCommand);
    context.subscriptions.push(testCommand);
    context.subscriptions.push(toggleRevertCommand);
    context.subscriptions.push(enableExtensionCommand);
    context.subscriptions.push(disableExtensionCommand);
    context.subscriptions.push(wrapJSXAttributesCommand);
    context.subscriptions.push(debugJSXDetectionCommand);
    context.subscriptions.push(testJSXBacktickCommand);
    context.subscriptions.push(documentChangeHandler);
    context.subscriptions.push(simplifiedTypingHandler);
    
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
        `Quotick auto-convert ${newEnabled ? 'enabled' : 'disabled'}`,
        'OK'
    );
}

async function toggleRevertFeature(): Promise<void> {
    const config = vscode.workspace.getConfiguration('quotick');
    const currentEnabled = config.get<boolean>('autoRemoveTemplateString', true);
    const newEnabled = !currentEnabled;
    
    await ConfigurationManager.updateConfiguration('autoRemoveTemplateString', newEnabled);
    
    vscode.window.showInformationMessage(
        `Quotick revert feature ${newEnabled ? 'enabled' : 'disabled'}`,
        'OK'
    );
}

async function setExtensionEnabled(enabled: boolean): Promise<void> {
    await ConfigurationManager.updateConfiguration('enableAutoConvert', enabled);
    vscode.window.showInformationMessage(
        `Quotick ${enabled ? 'enabled' : 'disabled'}`,
        'OK'
    );
}

async function wrapJSXAttributes(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
    }

    const document = editor.document;
    
    // Check if the document supports JSX
    if (!JSXDetector.isJSXSupportedLanguage(document.languageId)) {
        vscode.window.showWarningMessage('JSX attribute wrapping is only supported in JSX/TSX files');
        return;
    }

    try {
        console.log('Processing document for JSX attribute wrapping...');
        
        let conversionsCount = 0;
        const edits: vscode.TextEdit[] = [];
        
        // Process each line in the document
        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const line = document.lineAt(lineIndex);
            const text = line.text;
            
            // Find JSX elements in this line
            const jsxElements = findJSXElementsInLine(text, lineIndex);
            
            for (const element of jsxElements) {
                for (const attribute of element.attributes) {
                    // Check if attribute has interpolation and needs conversion
                    if (attribute.hasInterpolation) {
                        // If wrapped in backticks, convert to braces
                        if (attribute.isWrappedInBackticks) {
                            const attributeEdits = createJSXAttributeBacktickToBraceEdits(document, attribute);
                            if (attributeEdits.length > 0) {
                                edits.push(...attributeEdits);
                                conversionsCount++;
                            }
                        }
                        // If not wrapped in braces and not in backticks, wrap with braces
                        else if (!attribute.isWrappedInBraces) {
                            const attributeEdits = createJSXAttributeWrapEdits(document, attribute);
                            if (attributeEdits.length > 0) {
                                edits.push(...attributeEdits);
                                conversionsCount++;
                            }
                        }
                    }
                }
            }
        }
        
        if (edits.length > 0) {
            // Apply all edits
            const workspaceEdit = new vscode.WorkspaceEdit();
            workspaceEdit.set(document.uri, edits);
            
            const success = await vscode.workspace.applyEdit(workspaceEdit);
            
            if (success) {
                vscode.window.showInformationMessage(
                    `Quotick: Wrapped ${conversionsCount} JSX attribute${conversionsCount === 1 ? '' : 's'} with braces`,
                    'OK'
                );
            } else {
                vscode.window.showErrorMessage('Failed to apply JSX attribute wrapping', 'OK');
            }
        } else {
            vscode.window.showInformationMessage('No JSX attributes found that need wrapping', 'OK');
        }
    } catch (error) {
        console.error('Error processing JSX attributes:', error);
        vscode.window.showErrorMessage(`Error processing JSX attributes: ${error}`, 'OK');
    }
}

async function debugJSXDetection(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    
    console.log('Debug JSX Detection:', {
        languageId: document.languageId,
        position: `${position.line}:${position.character}`,
        lineText: document.lineAt(position.line).text
    });
    
    const attributeInfo = JSXDetector.getJSXAttributeInfo(document, position);
    if (attributeInfo) {
        console.log('JSX Attribute Detected:', attributeInfo);
        vscode.window.showInformationMessage(
            `JSX Attribute: ${attributeInfo.attributeName}="${attributeInfo.attributeValue}" (backticks: ${attributeInfo.isWrappedInBackticks}, interpolation: ${attributeInfo.hasInterpolation})`,
            'OK'
        );
    } else {
        console.log('No JSX attribute detected');
        vscode.window.showInformationMessage('No JSX attribute detected at current position', 'OK');
    }
}

async function testJSXBacktickConversion(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
    }

    const document = editor.document;
    const position = editor.selection.active;
    
    console.log('Testing JSX Backtick Conversion:', {
        languageId: document.languageId,
        position: `${position.line}:${position.character}`,
        lineText: document.lineAt(position.line).text
    });
    
    const edit = JSXBacktickConverter.convertBackticksToBraces(document, position);
    if (edit) {
        const success = await vscode.workspace.applyEdit(edit);
        if (success) {
            vscode.window.showInformationMessage('Successfully converted JSX backticks to braces!', 'OK');
        } else {
            vscode.window.showErrorMessage('Failed to apply conversion', 'OK');
        }
    } else {
        vscode.window.showInformationMessage('No JSX backtick attribute with interpolation found at current position', 'OK');
    }
}

function findJSXElementsInLine(text: string, lineNumber: number): any[] {
    const elements: any[] = [];
    const jsxTagRegex = /<([A-Za-z][A-Za-z0-9]*|@[A-Za-z][A-Za-z0-9]*)\s*([^>]*?)(\/?>)/g;
    let match;

    while ((match = jsxTagRegex.exec(text)) !== null) {
        const tagName = match[1];
        const attributesText = match[2];
        const isSelfClosing = match[3].includes('/');
        
        const startPosition = new vscode.Position(lineNumber, match.index);
        const endPosition = new vscode.Position(lineNumber, match.index + match[0].length);

        const attributes = parseJSXAttributes(attributesText, lineNumber, match.index);

        elements.push({
            tagName,
            isSelfClosing,
            attributes,
            startPosition,
            endPosition
        });
    }

    return elements;
}

function parseJSXAttributes(attributesText: string, lineNumber: number, tagStartIndex: number): any[] {
    const attributes: any[] = [];
    const jsxAttributeRegex = /(\w+)\s*=\s*([^>\s]+)/g;
    let match;

    while ((match = jsxAttributeRegex.exec(attributesText)) !== null) {
        const attributeName = match[1];
        const attributeValue = match[2];
        
        // Remove quotes from attribute value for analysis
        const cleanValue = attributeValue.replace(/^["'`]|["'`]$/g, '');
        
        const startPosition = new vscode.Position(lineNumber, tagStartIndex + match.index);
        const endPosition = new vscode.Position(lineNumber, tagStartIndex + match.index + match[0].length);

        attributes.push({
            isJSXAttribute: true,
            attributeName,
            attributeValue: cleanValue,
            startPosition,
            endPosition,
            hasInterpolation: JSXDetector.hasInterpolation(cleanValue),
            isWrappedInBraces: JSXDetector.isWrappedInBraces(cleanValue),
            isWrappedInBackticks: false
        });
    }

    return attributes;
}

function createJSXAttributeBacktickToBraceEdits(document: vscode.TextDocument, attribute: any): vscode.TextEdit[] {
    try {
        const line = document.lineAt(attribute.startPosition.line);
        const lineText = line.text;
        
        // Find the attribute value boundaries (including backticks)
        const attributePattern = new RegExp(
            `\\b${attribute.attributeName}\\s*=\\s*\`([^\`]*)\``,
            'g'
        );
        
        let match;
        let attributeStart = -1;
        
        while ((match = attributePattern.exec(lineText)) !== null) {
            const matchStart = match.index;
            const matchEnd = match.index + match[0].length;
            
            // Check if our position is within this match
            if (attribute.startPosition.character >= matchStart && 
                attribute.endPosition.character <= matchEnd) {
                attributeStart = matchStart;
                break;
            }
        }
        
        if (attributeStart === -1) {
            return [];
        }
        
        // Calculate positions for the edit
        const backtickStartPos = new vscode.Position(attribute.startPosition.line, attributeStart + match![0].indexOf('`'));
        const backtickEndPos = new vscode.Position(attribute.startPosition.line, attributeStart + match![0].lastIndexOf('`'));
        
        // Create edits to replace backticks with braces
        const edits: vscode.TextEdit[] = [];
        
        // Replace opening backtick with opening brace
        edits.push(new vscode.TextEdit(
            new vscode.Range(backtickStartPos, backtickStartPos.translate(0, 1)),
            '{'
        ));
        
        // Replace closing backtick with closing brace
        edits.push(new vscode.TextEdit(
            new vscode.Range(backtickEndPos, backtickEndPos.translate(0, 1)),
            '}'
        ));
        
        return edits;
    } catch (error) {
        console.error('Error creating JSX attribute backtick to brace edits:', error);
        return [];
    }
}

function createJSXAttributeWrapEdits(document: vscode.TextDocument, attribute: any): vscode.TextEdit[] {
    try {
        const line = document.lineAt(attribute.startPosition.line);
        const lineText = line.text;
        
        // Find the attribute value boundaries (including quotes)
        const attributePattern = new RegExp(
            `\\b${attribute.attributeName}\\s*=\\s*(["'\`])([^"'\`]*)\\1`,
            'g'
        );
        
        let match;
        let attributeStart = -1;
        let quoteChar = '';
        
        while ((match = attributePattern.exec(lineText)) !== null) {
            const matchStart = match.index;
            const matchEnd = match.index + match[0].length;
            
            // Check if our position is within this match
            if (attribute.startPosition.character >= matchStart && 
                attribute.endPosition.character <= matchEnd) {
                attributeStart = matchStart;
                quoteChar = match[1];
                break;
            }
        }
        
        if (attributeStart === -1) {
            return [];
        }
        
        // Calculate positions for the edit
        const quoteStartPos = new vscode.Position(attribute.startPosition.line, attributeStart + match![0].indexOf(quoteChar));
        const quoteEndPos = new vscode.Position(attribute.startPosition.line, attributeStart + match![0].lastIndexOf(quoteChar));
        
        // Create edits to replace quotes with braces
        const edits: vscode.TextEdit[] = [];
        
        // Replace opening quote with opening brace
        edits.push(new vscode.TextEdit(
            new vscode.Range(quoteStartPos, quoteStartPos.translate(0, 1)),
            '{'
        ));
        
        // Replace closing quote with closing brace
        edits.push(new vscode.TextEdit(
            new vscode.Range(quoteEndPos, quoteEndPos.translate(0, 1)),
            '}'
        ));
        
        return edits;
    } catch (error) {
        console.error('Error creating JSX attribute wrap edits:', error);
        return [];
    }
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
    const config = vscode.workspace.getConfiguration('quotick');
    const showWelcome = config.get('showWelcomeMessage', true);
    
    if (showWelcome) {
        vscode.window.showInformationMessage(
            'Quotick: Auto-conversion enabled! Type `${}` in quotes to convert to backticks. Delete `$` or `{` to revert back to quotes.',
            'Got it!'
        ).then(() => {
            config.update('showWelcomeMessage', false, vscode.ConfigurationTarget.Global);
        });
    }
}
