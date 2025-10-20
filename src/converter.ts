import * as vscode from "vscode";
import { QuoteRange, ConversionResult, TemplateLiteralMatch } from "./types";
import { TemplateLiteralDetector } from "./templateLiteralDetector";

export class QuoteConverter {
  /**
   * Convert quotes to backticks for a given quote range
   */
  static convertToBackticks(document: vscode.TextDocument, quoteRange: QuoteRange): ConversionResult {
    try {
      const edit = new vscode.WorkspaceEdit();
      
      // Replace opening quote with backtick
      edit.replace(
        document.uri, 
        new vscode.Range(quoteRange.start, quoteRange.start.translate(0, 1)), 
        '`'
      );
      
      // Replace closing quote with backtick
      edit.replace(
        document.uri, 
        new vscode.Range(quoteRange.end, quoteRange.end.translate(0, 1)), 
        '`'
      );
      
      return {
        success: true,
        edit
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Convert backticks to quotes for a given quote range
   */
  static convertBackticksToQuotes(
    document: vscode.TextDocument, 
    quoteRange: QuoteRange, 
    targetQuoteType: '"' | "'"
  ): ConversionResult {
    try {
      const edit = new vscode.WorkspaceEdit();
      
      // Replace opening backtick with quote
      edit.replace(
        document.uri, 
        new vscode.Range(quoteRange.start, quoteRange.start.translate(0, 1)), 
        targetQuoteType
      );
      
      // Replace closing backtick with quote
      edit.replace(
        document.uri, 
        new vscode.Range(quoteRange.end, quoteRange.end.translate(0, 1)), 
        targetQuoteType
      );
      
      return {
        success: true,
        edit
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Handle JSX prop conversion with brackets
   */
  static convertToJSXProps(
    document: vscode.TextDocument,
    quoteRange: QuoteRange,
    currentChar: number,
    lineNumber: number,
    endQuoteIndex: number,
    startQuoteIndex: number
  ): ConversionResult {
    try {
      const edit = new vscode.WorkspaceEdit();
      
      // Replace quotes with braces
      edit.replace(
        document.uri,
        new vscode.Range(quoteRange.start, quoteRange.start.translate(0, 1)),
        "{"
      );
      edit.replace(
        document.uri,
        new vscode.Range(quoteRange.end, quoteRange.end.translate(0, 1)),
        "}"
      );
      
      // Add closing brace after current position
      edit.insert(
        document.uri,
        new vscode.Position(lineNumber, currentChar + 1),
        '}'
      );
      
      // Add backticks around the braces
      edit.insert(
        document.uri,
        new vscode.Position(lineNumber, endQuoteIndex),
        "`"
      );
      edit.insert(
        document.uri,
        new vscode.Position(lineNumber, startQuoteIndex + 1),
        "`"
      );
      
      const newSelections = [new vscode.Selection(
        lineNumber,
        currentChar + 2,
        lineNumber,
        currentChar + 2
      )];
      
      return {
        success: true,
        edit,
        newSelections
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Handle JSX prop conversion with empty braces
   */
  static convertToJSXPropsEmpty(
    document: vscode.TextDocument,
    quoteRange: QuoteRange,
    currentChar: number,
    lineNumber: number,
    endQuoteIndex: number,
    startQuoteIndex: number
  ): ConversionResult {
    try {
      const edit = new vscode.WorkspaceEdit();
      
      // Replace quotes with braces
      edit.replace(
        document.uri,
        new vscode.Range(quoteRange.start, quoteRange.start.translate(0, 1)),
        "{"
      );
      edit.replace(
        document.uri,
        new vscode.Range(quoteRange.end, quoteRange.end.translate(0, 1)),
        "}"
      );
      
      // Add backticks around the braces
      edit.insert(
        document.uri,
        new vscode.Position(lineNumber, endQuoteIndex),
        "`"
      );
      edit.insert(
        document.uri,
        new vscode.Position(lineNumber, startQuoteIndex + 1),
        "`"
      );
      
      const newSelections = [new vscode.Selection(
        lineNumber,
        currentChar + 2,
        lineNumber,
        currentChar + 2
      )];
      
      return {
        success: true,
        edit,
        newSelections
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Find all template literals in quotes in the document
   */
  static findAllTemplateLiterals(document: vscode.TextDocument): TemplateLiteralMatch[] {
    const results: TemplateLiteralMatch[] = [];
    const text = document.getText();
    
    // Find all quoted strings
    const quoteRegex = /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g;
    let match;
    
    while ((match = quoteRegex.exec(text)) !== null) {
      const content = match[2];
      
      // Skip if contains backticks or no template literals
      if (TemplateLiteralDetector.hasBackticks(content) || 
          !TemplateLiteralDetector.hasTemplateLiteralSyntax(content)) {
        continue;
      }
      
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + match[0].length - 1);
      
      // Check if in valid context
      if (!TemplateLiteralDetector.isValidContext(document, startPos)) {
        continue;
      }
      
      results.push({
        start: startPos,
        end: endPos,
        content,
        hasTemplateSyntax: true,
        isValidContext: true
      });
    }
    
    return results;
  }
  
  /**
   * Apply conversion result to the document
   */
  static async applyConversion(result: ConversionResult): Promise<boolean> {
    if (!result.success || !result.edit) {
      return false;
    }
    
    try {
      return await vscode.workspace.applyEdit(result.edit);
    } catch (error) {
      console.error('Failed to apply conversion:', error);
      return false;
    }
  }
}