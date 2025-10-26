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
            
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
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
                
                // Handle '=' key - insert braces snippet for JSX attributes
                if (change.text === "=") {
                    this.handleEqualsKey(document, position, editor);
                    continue;
                }
                
                // Handle backspace to remove empty braces
                if (change.text === "" && change.rangeLength === 1) {
                    this.handleBackspace(document, position, editor);
                    continue;
                }
                
                // Handle automatic wrapping when typing } after ${ or { pattern in backticks
                if (change.text === '}') {
                    this.handleBraceCompletionInBackticks(document, position, '}');
                }
                
                // Handle automatic wrapping when typing closing backtick
                if (change.text === '`') {
                    this.handleBraceCompletionInBackticks(document, position, '`');
                }
            }
        });
        
        this.disposables.push(disposable);
    }
    
    /**
     * Handle '=' key press in JSX attributes
     * This inserts {$0} after = but only for plain attribute values (not for backticks)
     */
    private handleEqualsKey(document: vscode.TextDocument, position: vscode.Position, editor: vscode.TextEditor): void {
        try {
            const line = document.lineAt(position.line);
            const lineText = line.text;
            const beforeEquals = lineText.substring(0, position.character);

            // Check if we're in a JSX context - look for < before the =
            if (!beforeEquals.match(/<[A-Za-z][A-Za-z0-9]*\s*[^>]*$/)) {
                return;
            }

            // Find the start of the attribute name
            let startOfPropName = position.character - 1;
            while (
                startOfPropName >= 0 &&
                /[a-zA-Z0-9_-]/.test(lineText[startOfPropName])
            ) {
                startOfPropName--;
            }
            startOfPropName++;

            // Check if we found a valid prop name
            if (startOfPropName >= position.character) {
                return;
            }

            // Check if we're in a string literal (don't trigger)
            if (this.isInStringLiteral(lineText, position.character)) {
                return;
            }

            // Don't insert braces if user is going to type backticks
            // We'll let the backtick handler handle that case
            // This prevents conflicts with the backtick wrapping logic
            
            // Insert the braces snippet at position after the = character
            const snippet = new vscode.SnippetString("{$0}");
            const insertPosition = new vscode.Position(position.line, position.character + 1);
            
            editor.insertSnippet(
                snippet,
                insertPosition
            ).then((success) => {
                if (success) {
                    console.log("Snippet inserted successfully at", insertPosition.line, insertPosition.character);
                } else {
                    console.error("Snippet insertion failed!");
                }
            });
        } catch (error) {
            console.error('Error handling equals key:', error);
        }
    }

    /**
     * Handle backspace to remove empty braces
     */
    private handleBackspace(document: vscode.TextDocument, position: vscode.Position, editor: vscode.TextEditor): void {
        try {
            const line = document.lineAt(position.line);
            const lineText = line.text;

            const charBefore = lineText.substring(position.character - 1, position.character);
            const charAfter = lineText.substring(position.character, position.character + 1);

            // If backspacing over a closing brace, and there's an opening brace before, remove both
            if (charBefore === "{" && charAfter === "}") {
                editor.edit((editBuilder) => {
                    editBuilder.delete(
                        new vscode.Range(
                            position.line,
                            position.character - 1,
                            position.line,
                            position.character + 1
                        )
                    );
                });
            }
        } catch (error) {
            console.error('Error handling backspace:', error);
        }
    }

    /**
     * Handle automatic wrapping of backticks with braces when interpolation is detected
     */
    private handleBraceCompletionInBackticks(document: vscode.TextDocument, position: vscode.Position, typedChar: string): void {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }

            const line = document.lineAt(position.line);
            const lineText = line.text;
            
            // Find the nearest backtick before the just-typed character
            const textBeforeChar = lineText.substring(0, position.character - 1);
            const backtickBeforeIndex = textBeforeChar.lastIndexOf('`');
            if (backtickBeforeIndex === -1) {
                return;
            }
            
            // Find the nearest backtick after the just-typed character
            // If we just typed a backtick, there won't be one after yet
            const textAfterChar = lineText.substring(position.character);
            const backtickAfterIndex = textAfterChar.indexOf('`');
            
            // Get the content between backticks
            let fullContent: string;
            if (typedChar === '`' && backtickAfterIndex === -1) {
                // We're typing the closing backtick, so use content up to the cursor
                fullContent = lineText.substring(backtickBeforeIndex + 1, position.character - 1);
            } else if (backtickAfterIndex !== -1) {
                // There's a backtick after, get content between them
                const contentStart = backtickBeforeIndex + 1;
                const contentEnd = position.character - 1 + backtickAfterIndex;
                fullContent = lineText.substring(contentStart, contentEnd);
            } else {
                return;
            }
            
            // Check if content has interpolation pattern ${...} or just {}
            const hasInterpolation = /\$\{[^}]*\}/.test(fullContent);
            const hasEmptyBraces = /\{\s*\}/.test(fullContent);
            
            if (!hasInterpolation && !hasEmptyBraces) {
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
            
            // Check if already wrapped in braces (but allow if user types backtick after {)
            const charBeforeBacktick = backtickBeforeIndex > 0 ? lineText.charAt(backtickBeforeIndex - 1) : ' ';
            if (charBeforeBacktick === '{' && typedChar === '`') {
                // This is the case where user typed = getting {|} then typed backtick
                // We want to replace the } with `} and add another } after
                this.handleBacktickAfterBrace(document, position, editor, backtickBeforeIndex);
                return;
            } else if (charBeforeBacktick === '{' && typedChar === '}') {
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
            
            // Insert closing brace after the last backtick
            let closingBracePosition: vscode.Position;
            if (typedChar === '`' && backtickAfterIndex === -1) {
                // Just typed the closing backtick, insert } after it
                closingBracePosition = new vscode.Position(position.line, position.character);
            } else {
                // Insert after the backtick that's coming after the typed char
                closingBracePosition = new vscode.Position(position.line, position.character + backtickAfterIndex + 1);
            }
            
            edit.insert(
                document.uri,
                closingBracePosition,
                '}'
            );
            
            vscode.workspace.applyEdit(edit).then(success => {
                if (success) {
                    console.log('Automatically wrapped backticks with braces');
                    
                    // Move cursor to after the closing brace
                    setTimeout(() => {
                        const finalPos = typedChar === '`' 
                            ? position.character + 1  // After the closing backtick + } 
                            : position.character + backtickAfterIndex + 2; // After the } after the backtick
                        const finalPosition = new vscode.Position(position.line, finalPos);
                        editor.selection = new vscode.Selection(finalPosition, finalPosition);
                    }, 50);
                }
            });
        } catch (error) {
            console.error('Error handling brace completion:', error);
        }
    }
    
    /**
     * Handle case where user types backtick after opening brace from equals handler
     * e.g., className={|} then user types `, should become className={`|} and replace } with `}
     */
    private handleBacktickAfterBrace(document: vscode.TextDocument, position: vscode.Position, editor: vscode.TextEditor, _braceIndex: number): void {
        const line = document.lineAt(position.line);
        const lineText = line.text;
        
        // Look for the } that was inserted by the equals handler
        // It should be right after the cursor position
        const charAfterCursor = lineText.charAt(position.character);
        if (charAfterCursor === '}') {
            // Replace } with `}`
            editor.edit((editBuilder) => {
                editBuilder.replace(
                    new vscode.Range(position.line, position.character, position.line, position.character + 1),
                    '`'
                );
            }).then(() => {
                // Insert closing } after the cursor position
                setTimeout(() => {
                    const edit = new vscode.WorkspaceEdit();
                    edit.insert(
                        document.uri,
                        new vscode.Position(position.line, position.character + 1),
                        '}'
                    );
                    vscode.workspace.applyEdit(edit);
                }, 50);
            });
        }
        console.log('Handling backtick after brace from equals handler');
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
