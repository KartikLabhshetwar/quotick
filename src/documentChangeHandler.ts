import * as vscode from "vscode";
import { ConfigurationManager } from "./configuration";
import { QuoteDetector } from "./quoteDetector";
import { TemplateLiteralDetector } from "./templateLiteralDetector";
import { QuoteConverter } from "./converter";
import { DocumentCopy, QuoteRange } from "./types";
import { SvelteDetector } from "./svelteDetector";

export class DocumentChangeHandler {
  private previousDocument: DocumentCopy | undefined = undefined;
  private disposables: vscode.Disposable[] = [];
  
  constructor() {
    this.setupDocumentChangeListener();
    this.setupConfigurationListener();
  }
  
  private setupDocumentChangeListener(): void {
    const disposable = vscode.workspace.onDidChangeTextDocument(async (e) => {
      const configuration = ConfigurationManager.getConfiguration();
      
      if (!configuration.enabled || !e.contentChanges[0]) {
        return;
      }
      
      const changes = e.contentChanges[0];
      
      if (!ConfigurationManager.isLanguageSupported(e.document.languageId) ||
          ConfigurationManager.isFileExcluded(e.document.fileName)) {
        return;
      }
      
      // For Svelte files, check if we're within a script tag
      if (e.document.languageId === 'svelte') {
        const cursorPosition = new vscode.Position(
          changes.range.start.line,
          changes.range.start.character
        );
        
        if (!SvelteDetector.isWithinScriptTag(e.document, cursorPosition)) {
          return; // Don't process changes outside of script tags in Svelte files
        }
      }
      
      try {
        await this.processDocumentChange(e.document, changes, configuration);
      } catch (error) {
        console.error('Error processing document change:', error);
      }
    });
    
    this.disposables.push(disposable);
  }
  
  private setupConfigurationListener(): void {
    const disposable = ConfigurationManager.onConfigurationChange((e) => {
      if (e.affectsConfiguration('quotick')) {
        // Configuration changed, could trigger re-evaluation if needed
        console.log('Quotick configuration changed');
      }
    });
    
    this.disposables.push(disposable);
  }
  
  private async processDocumentChange(
    document: vscode.TextDocument,
    changes: vscode.TextDocumentContentChangeEvent,
    configuration: any
  ): Promise<void> {
    let selections: vscode.Selection[] = [];
    
    if (!vscode.window.activeTextEditor || vscode.window.activeTextEditor.selections.length === 0) {
      return;
    }
    
    for (const selection of vscode.window.activeTextEditor.selections) {
      const lineNumber = selection.start.line;
      const currentChar = changes.range.start.character;
      const lineText = document.lineAt(lineNumber).text;
      
      if (currentChar < 1) {
        return;
      }
      
      const startPosition = new vscode.Position(lineNumber, currentChar - 1);
      const endPosition = new vscode.Position(lineNumber, currentChar);
      
      const quoteChar = ConfigurationManager.getQuoteChar();
      const quoteRange = QuoteDetector.getQuoteRange(
        document,
        new vscode.Position(lineNumber, currentChar),
        quoteChar,
        configuration.convertOutermostQuotes
      );
      
      if (!quoteRange) {
        return;
      }
      
      const startQuoteIndex = quoteRange.start.character;
      const endQuoteIndex = quoteRange.end.character;
      
      const priorChar = document.getText(new vscode.Range(startPosition, endPosition));
      const nextChar = document.getText(new vscode.Range(startPosition.translate(0, 2), endPosition.translate(0, 2)));
      const nextTwoChars = document.getText(new vscode.Range(startPosition.translate(0, 2), endPosition.translate(0, 3)));
      
      if (QuoteDetector.notInComment(lineText, currentChar, startQuoteIndex, endQuoteIndex) &&
          QuoteDetector.quotesMatch(lineText, startQuoteIndex, endQuoteIndex)) {
        
        // Handle template literal reversion when $ or { is removed
        if (this.previousDocument && await this.handleTemplateLiteralReversion(
          document, lineNumber, currentChar, changes, configuration)) {
          return;
        }
        
        await this.handleQuoteConversion(
          document,
          lineText,
          currentChar,
          lineNumber,
          quoteRange,
          priorChar,
          nextChar,
          nextTwoChars,
          changes.text,
          configuration,
          selections
        );
      }
    }
    
    if (vscode.window.activeTextEditor && selections.length > 0) {
      vscode.window.activeTextEditor.selections = selections;
    }
    
    if (configuration.autoRemoveTemplateString) {
      this.updatePreviousDocument(document);
    }
  }
  
  private async handleQuoteConversion(
    document: vscode.TextDocument,
    lineText: string,
    currentChar: number,
    lineNumber: number,
    quoteRange: QuoteRange,
    priorChar: string,
    nextChar: string,
    nextTwoChars: string,
    changeText: string,
    configuration: any,
    selections: vscode.Selection[]
  ): Promise<void> {
    const regex = new RegExp(/<\/?(?:[\w.:-]+\s*(?:\s+(?:[\w.:$-]+(?:=(?:"(?:\\[^]|[^\\"])*"|'(?:\\[^]|[^\\'])*'|[^\s{'">=]+|\{(?:\{(?:\{[^{}]*\}|[^{}])*\}|[^{}])+\}))?|\{\s*\.{3}\s*[a-z_$][\w$]*(?:\.[a-z_$][\w$]*)*\s*\}))*\s*\/?)?>/gm);
    
    // Keep the search reasonable
    const startLine = lineNumber > 20 ? lineNumber - 20 : 0;
    const endLine = document.lineCount - lineNumber > 20 ? lineNumber + 20 : document.lineCount;
    const multiLineText = document.getText(new vscode.Range(startLine, 0, endLine, 200));
    let matches = multiLineText.match(regex);
    
    if (lineText.includes(';') || lineText.includes(",") || lineText.substring(0, currentChar).includes(":")) {
      // Treat as a single line
      matches = null;
    }
    
    // Handle backtick removal
    if (this.previousDocument) {
      const current = TemplateLiteralDetector.getTemplateStringInfo(
        lineText, 
        currentChar, 
        lineNumber, 
        document, 
        configuration.convertWithinTemplateString ?? true
      );
      
      const backtickPositions = current.positions;
      const notTemplateStringWithinBackticks = current.withinBackticks && !current.inTemplateString;
      const usedToBeTemplateString = TemplateLiteralDetector.getTemplateStringInfo(
        this.previousDocument!.lines[lineNumber].text, 
        currentChar, 
        lineNumber, 
        this.previousDocument!, 
        configuration.convertWithinTemplateString ?? true
      ).inTemplateString;
      
      if (notTemplateStringWithinBackticks &&
          usedToBeTemplateString &&
          configuration.autoRemoveTemplateString &&
          !changeText &&
          backtickPositions) {
        
        const result = QuoteConverter.convertBackticksToQuotes(
          document,
          quoteRange,
          configuration.quoteType === 'single' ? '\'' : '"'
        );
        
        if (result.success) {
          await QuoteConverter.applyConversion(result);
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            editor.selection = new vscode.Selection(
              new vscode.Position(lineNumber, currentChar), 
              new vscode.Position(lineNumber, currentChar)
            );
          }
        }
        return;
      }
    }
    
    // Handle JSX prop conversion
    if (matches !== null && configuration.addBracketsToProps) {
      await this.handleJSXPropConversion(
        document, 
        quoteRange, 
        currentChar, 
        lineNumber, 
        priorChar, 
        changeText, 
        selections
      );
    } else if (!TemplateLiteralDetector.withinBackticks(
      lineText, 
      currentChar, 
      lineNumber, 
      document, 
      configuration.convertWithinTemplateString ?? true
    )) {
      await this.handleTemplateLiteralConversion(
        document,
        quoteRange,
        currentChar,
        lineNumber,
        priorChar,
        nextChar,
        nextTwoChars,
        changeText,
        configuration,
        selections
      );
    }
  }
  
  private async handleJSXPropConversion(
    document: vscode.TextDocument,
    quoteRange: QuoteRange,
    currentChar: number,
    lineNumber: number,
    priorChar: string,
    changeText: string,
    selections: vscode.Selection[]
  ): Promise<void> {
    const endQuoteIndex = quoteRange.end.character;
    const startQuoteIndex = quoteRange.start.character;
    
    if (changeText === "{" && priorChar === "$") {
      const result = QuoteConverter.convertToJSXProps(
        document, quoteRange, currentChar, lineNumber, endQuoteIndex, startQuoteIndex
      );
      
      if (result.success) {
        await QuoteConverter.applyConversion(result);
        if (result.newSelections) {
          selections.push(...result.newSelections);
        }
      }
    } else if (changeText === "{}" && priorChar === "$") {
      const result = QuoteConverter.convertToJSXPropsEmpty(
        document, quoteRange, currentChar, lineNumber, endQuoteIndex, startQuoteIndex
      );
      
      if (result.success) {
        await QuoteConverter.applyConversion(result);
        if (result.newSelections) {
          selections.push(...result.newSelections);
        }
      }
    }
  }
  
  private async handleTemplateLiteralConversion(
    document: vscode.TextDocument,
    quoteRange: QuoteRange,
    currentChar: number,
    lineNumber: number,
    priorChar: string,
    nextChar: string,
    nextTwoChars: string,
    changeText: string,
    configuration: any,
    selections: vscode.Selection[]
  ): Promise<void> {
    const lineText = document.lineAt(lineNumber).text;
    const autoClosingBrackets = configuration.autoClosingBrackets;
    
    if (changeText === "{}" && priorChar === "$" && (currentChar < 2 || (lineText.charAt(currentChar - 2) !== "\\"))) {
      const result = QuoteConverter.convertToBackticks(document, quoteRange);
      if (result.success) {
        await QuoteConverter.applyConversion(result);
        selections.push(new vscode.Selection(
          lineNumber,
          currentChar + 1,
          lineNumber,
          currentChar + 1
        ));
      }
    } else if (changeText === "{" && priorChar === "$" && autoClosingBrackets !== 'never' && 
               (currentChar < 2 || (lineText.charAt(currentChar - 2) !== "\\"))) {
      const result = QuoteConverter.convertToBackticks(document, quoteRange);
      if (result.success) {
        await QuoteConverter.applyConversion(result);
        
        // Add closing brace
        const edit = new vscode.WorkspaceEdit();
        edit.insert(document.uri, new vscode.Position(lineNumber, currentChar + 1), "}");
        await vscode.workspace.applyEdit(edit);
        
        selections.push(new vscode.Selection(
          lineNumber,
          currentChar + 1,
          lineNumber,
          currentChar + 1
        ));
      }
    } else if (autoClosingBrackets === 'never' && priorChar === '$' && changeText === '{' && 
               (currentChar < 2 || (lineText.charAt(currentChar - 2) !== "\\"))) {
      const result = QuoteConverter.convertToBackticks(document, quoteRange);
      if (result.success) {
        await QuoteConverter.applyConversion(result);
        selections.push(new vscode.Selection(
          lineNumber,
          currentChar + 1,
          lineNumber,
          currentChar + 1
        ));
      }
    } else if (changeText === '$' && nextTwoChars === '{}' && (currentChar < 1 || (lineText.charAt(currentChar - 1) !== "\\"))) {
      const result = QuoteConverter.convertToBackticks(document, quoteRange);
      if (result.success) {
        await QuoteConverter.applyConversion(result);
        selections.push(new vscode.Selection(
          lineNumber,
          currentChar + 2,
          lineNumber,
          currentChar + 2
        ));
      }
    } else if (changeText === '$' && nextChar === '{' && autoClosingBrackets !== 'never' && 
               (currentChar < 1 || (lineText.charAt(currentChar - 1) !== "\\"))) {
      const result = QuoteConverter.convertToBackticks(document, quoteRange);
      if (result.success) {
        await QuoteConverter.applyConversion(result);
        
        // Add closing brace
        const edit = new vscode.WorkspaceEdit();
        edit.insert(document.uri, new vscode.Position(lineNumber, currentChar + 2), "}");
        await vscode.workspace.applyEdit(edit);
        
        selections.push(new vscode.Selection(
          lineNumber,
          currentChar + 2,
          lineNumber,
          currentChar + 2
        ));
      }
    }
  }
  
  /**
   * Handle reversion of template literals back to quotes when $ or { characters are removed
   */
  private async handleTemplateLiteralReversion(
    document: vscode.TextDocument,
    lineNumber: number,
    currentChar: number,
    changes: vscode.TextDocumentContentChangeEvent,
    configuration: any
  ): Promise<boolean> {
    // Only handle deletions (empty change text)
    if (changes.text !== '') {
      return false;
    }

    // Check if previous document exists and has this line
    if (!this.previousDocument || !this.previousDocument.lines[lineNumber]) {
      return false;
    }

    const currentLine = document.lineAt(lineNumber).text;
    const previousLine = this.previousDocument.lines[lineNumber].text;
    
    // Check if we're dealing with backticks
    if (!currentLine.includes('`')) {
      return false;
    }

    // Find backtick positions in current line
    const backtickStart = currentLine.indexOf('`');
    const backtickEnd = currentLine.lastIndexOf('`');
    
    if (backtickStart === -1 || backtickEnd === -1 || backtickStart === backtickEnd) {
      return false;
    }

    // Check if the previous line had template literal syntax (${...})
    const previousContent = previousLine.substring(backtickStart + 1, backtickEnd);
    const currentContent = currentLine.substring(backtickStart + 1, backtickEnd);
    
    // Check if template literal syntax was removed
    const hadTemplateSyntax = /\$\{[^}]*\}/.test(previousContent);
    const hasTemplateSyntax = /\$\{[^}]*\}/.test(currentContent);
    
    // If template syntax was removed, revert to quotes
    if (hadTemplateSyntax && !hasTemplateSyntax) {
      const quoteType = configuration.quoteType === 'single' ? '\'' : '"';
      const result = QuoteConverter.convertBackticksToQuotes(
        document,
        {
          start: new vscode.Position(lineNumber, backtickStart),
          end: new vscode.Position(lineNumber, backtickEnd),
          quoteType: quoteType as '"' | "'" | '`',
          content: currentContent,
          lineNumber: lineNumber
        },
        quoteType as '"' | "'"
      );
      
      if (result.success) {
        await QuoteConverter.applyConversion(result);
        
        // Update cursor position
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          editor.selection = new vscode.Selection(
            new vscode.Position(lineNumber, currentChar),
            new vscode.Position(lineNumber, currentChar)
          );
        }
        
        return true;
      }
    }

    // Additional check: if $ or { was specifically removed
    const removedChar = this.getRemovedCharacter(previousLine, currentLine, currentChar);
    if (removedChar === '$' || removedChar === '{') {
      // Check if this removal broke the template literal syntax
      const remainingContent = currentLine.substring(backtickStart + 1, backtickEnd);
      const hasValidTemplateSyntax = /\$\{[^}]*\}/.test(remainingContent);
      
      if (!hasValidTemplateSyntax) {
        const quoteType = configuration.quoteType === 'single' ? '\'' : '"';
        const result = QuoteConverter.convertBackticksToQuotes(
          document,
          {
            start: new vscode.Position(lineNumber, backtickStart),
            end: new vscode.Position(lineNumber, backtickEnd),
            quoteType: quoteType as '"' | "'" | '`',
            content: remainingContent,
            lineNumber: lineNumber
          },
          quoteType as '"' | "'"
        );
        
        if (result.success) {
          await QuoteConverter.applyConversion(result);
          
          // Update cursor position
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            editor.selection = new vscode.Selection(
              new vscode.Position(lineNumber, currentChar),
              new vscode.Position(lineNumber, currentChar)
            );
          }
          
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Helper function to determine what character was removed
   */
  private getRemovedCharacter(previousLine: string, currentLine: string, currentChar: number): string | null {
    // Simple heuristic: compare lengths and check around cursor position
    if (previousLine.length > currentLine.length) {
      // Character was removed
      const beforeCursor = previousLine.substring(0, currentChar);
      const afterCursor = previousLine.substring(currentChar + 1);
      const reconstructed = beforeCursor + afterCursor;
      
      if (reconstructed === currentLine) {
        return previousLine.charAt(currentChar);
      }
    }
    
    return null;
  }

  private updatePreviousDocument(document: vscode.TextDocument): void {
    this.previousDocument = { lines: [], lineCount: document.lineCount };
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      this.previousDocument.lines.push(line);
    }
  }
  
  public dispose(): void {
    this.disposables.forEach(d => d.dispose());
  }
}
