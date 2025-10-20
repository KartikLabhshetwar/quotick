import * as vscode from "vscode";
import { QuoteChar, Position, QuoteDetectionResult, QuoteRange } from "./types";

export class QuoteDetector {
  /**
   * Find quote indices in a line of text
   */
  static getQuoteIndex(
    line: string, 
    quoteChar: QuoteChar, 
    position: Position, 
    convertOutermostQuotes?: boolean
  ): number {
    const findFirstIndex = (position === 'start' && convertOutermostQuotes) || 
                          (position === 'end' && !convertOutermostQuotes);
    
    if (quoteChar === "both") {
      const double = findFirstIndex ? line.indexOf('"') : line.lastIndexOf('"');
      const single = findFirstIndex ? line.indexOf("'") : line.lastIndexOf("'");
      const backtick = findFirstIndex ? line.indexOf('`') : line.lastIndexOf('`');
      
      if (double >= 0 && single >= 0) {
        // Handle nested quotes
        return findFirstIndex ? Math.min(double, single) : Math.max(double, single);
      } else if (double >= 0) {
        return double;
      } else if (single >= 0) {
        return single;
      } else {
        return backtick;
      }
    } else {
      if (findFirstIndex) {
        return line.indexOf('`') !== -1 ? line.indexOf('`') : line.indexOf(quoteChar);
      } else {
        return line.lastIndexOf('`') !== -1 ? line.lastIndexOf('`') : line.lastIndexOf(quoteChar);
      }
    }
  }
  
  /**
   * Detect quotes around a specific position
   */
  static detectQuotes(
    document: vscode.TextDocument,
    position: vscode.Position,
    quoteChar: QuoteChar,
    convertOutermostQuotes?: boolean
  ): QuoteDetectionResult | null {
    const lineText = document.lineAt(position.line).text;
    const currentChar = position.character;
    
    if (currentChar < 1) {
      return null;
    }
    
    const startQuoteIndex = this.getQuoteIndex(
      lineText.substring(0, currentChar), 
      quoteChar, 
      'start', 
      convertOutermostQuotes
    );
    
    if (startQuoteIndex < 0) {
      return null;
    }
    
    const endQuoteIndex = currentChar + 1 + this.getQuoteIndex(
      lineText.substring(currentChar + 1, lineText.length), 
      quoteChar, 
      'end', 
      convertOutermostQuotes
    );
    
    if (endQuoteIndex <= startQuoteIndex) {
      return null;
    }
    
    const content = lineText.slice(startQuoteIndex + 1, endQuoteIndex);
    
    return {
      found: true,
      startIndex: startQuoteIndex,
      endIndex: endQuoteIndex,
      quoteChar: lineText.charAt(startQuoteIndex) as QuoteChar,
      content
    };
  }
  
  /**
   * Check if a position is within quotes
   */
  static isWithinQuotes(
    document: vscode.TextDocument,
    position: vscode.Position,
    quoteChar: QuoteChar,
    convertOutermostQuotes?: boolean
  ): boolean {
    const detection = this.detectQuotes(document, position, quoteChar, convertOutermostQuotes);
    return detection?.found ?? false;
  }
  
  /**
   * Get quote range for a position
   */
  static getQuoteRange(
    document: vscode.TextDocument,
    position: vscode.Position,
    quoteChar: QuoteChar,
    convertOutermostQuotes?: boolean
  ): QuoteRange | null {
    const detection = this.detectQuotes(document, position, quoteChar, convertOutermostQuotes);
    
    if (!detection) {
      return null;
    }
    
    const startPosition = new vscode.Position(position.line, detection.startIndex);
    const endPosition = new vscode.Position(position.line, detection.endIndex);
    
    return {
      start: startPosition,
      end: endPosition,
      quoteType: detection.quoteChar as '"' | "'" | '`',
      content: detection.content,
      lineNumber: position.line
    };
  }
  
  /**
   * Check if the position is not in a comment
   */
  static notInComment(
    lineText: string, 
    charIndex: number, 
    startQuoteIndex: number, 
    endQuoteIndex: number
  ): boolean {
    const beforeCursor = lineText.substring(0, charIndex);
    const commentIndex = beforeCursor.indexOf("//");
    
    if (commentIndex === -1) {
      return true;
    }
    
    // Check if comment is within the quote range
    return commentIndex > startQuoteIndex && commentIndex < endQuoteIndex;
  }
  
  /**
   * Check if quotes match (same type)
   */
  static quotesMatch(
    lineText: string, 
    startQuoteIndex: number, 
    endQuoteIndex: number
  ): boolean {
    return lineText.charAt(startQuoteIndex) === lineText.charAt(endQuoteIndex);
  }
}
