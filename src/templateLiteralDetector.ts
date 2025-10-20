import * as vscode from "vscode";
import { TemplateStringInfo, DocumentCopy, Position } from "./types";

export class TemplateLiteralDetector {
  /**
   * Check if text contains template literal syntax ${}
   */
  static hasTemplateLiteralSyntax(content: string): boolean {
    return /\$\{[^}]*\}/.test(content);
  }
  
  /**
   * Check if text contains backticks
   */
  static hasBackticks(content: string): boolean {
    return content.includes('`');
  }
  
  /**
   * Get template string information for a position
   */
  static getTemplateStringInfo(
    line: string,
    currentCharIndex: number,
    cursorLine: number,
    document: vscode.TextDocument | DocumentCopy,
    convertWithinTemplateString: boolean
  ): TemplateStringInfo {
    const withinLine = line.substring(0, currentCharIndex).includes("`") && 
                      line.substring(currentCharIndex, line.length).includes("`");
    
    if (withinLine) {
      const startIndex = line.substring(0, currentCharIndex).indexOf("`");
      const endIndex = currentCharIndex + line.substring(currentCharIndex, line.length).indexOf("`");
      const startBracketIndex = line.substring(startIndex).indexOf('${');
      const endBracketIndex = line.substring(startBracketIndex + 1, endIndex).indexOf("}");
      
      const withinBackticks = startIndex >= 0 && endIndex > 0;
      const inTemplateString = withinBackticks && startBracketIndex > 0 && endBracketIndex > 0 && endIndex > endBracketIndex;
      
      if (!convertWithinTemplateString) {
        return { 
          withinBackticks, 
          inTemplateString, 
          positions: { 
            startBacktickPosition: new vscode.Position(cursorLine, startIndex), 
            endBacktickPosition: new vscode.Position(cursorLine, endIndex) 
          } 
        };
      } else if (convertWithinTemplateString && withinBackticks) {
        return { withinBackticks: startBracketIndex > 0, inTemplateString };
      }
      
      return { withinBackticks: true, inTemplateString };
    } else {
      const lineIndex = cursorLine;
      const currentLine = 'lines' in document ? document.lines[lineIndex].text : document.lineAt(lineIndex).text;
      const startOfLine = currentLine.substring(0, currentCharIndex);
      const endOfLine = currentLine.substring(currentCharIndex, line.length);
      
      return { 
        withinBackticks: this.hasBacktick(lineIndex, startOfLine, document, 'start') && 
                        this.hasBacktick(lineIndex, endOfLine, document, 'end'), 
        inTemplateString: false 
      };
    }
  }
  
  /**
   * Check if there's a backtick in the specified direction
   */
  private static hasBacktick(
    lineIndex: number, 
    currentLine: string, 
    document: vscode.TextDocument | DocumentCopy, 
    position: Position
  ): boolean {
    if (position === 'start') {
      lineIndex -= 1;
    }
    
    while (position === 'start' ? lineIndex >= 0 : lineIndex < document.lineCount) {
      const backTick = currentLine.indexOf("`");
      const semiColon = currentLine.indexOf(";");
      const comma = currentLine.indexOf(",");
      
      if (backTick >= 0 && semiColon >= 0 && semiColon < backTick) {
        return true;
      } else if (backTick >= 0 && semiColon >= 0 && semiColon > backTick) {
        return false;
      } else if (backTick >= 0 && comma >= 0 && comma < backTick) {
        return true;
      } else if (backTick >= 0 && comma >= 0 && comma > backTick) {
        return false;
      } else if (backTick >= 0) {
        return true;
      } else if (semiColon >= 0 || comma >= 0) {
        return false;
      }
      
      if (lineIndex > -1) {
        currentLine = 'lines' in document ? document.lines[lineIndex].text : document.lineAt(lineIndex).text;
      }
      
      position === 'start' ? lineIndex -= 1 : lineIndex += 1;
    }
    
    return false;
  }
  
  /**
   * Check if the current position is within backticks
   */
  static withinBackticks(
    line: string,
    currentCharIndex: number,
    cursorLine: number,
    document: vscode.TextDocument,
    convertWithinTemplateString: boolean
  ): boolean {
    const info = this.getTemplateStringInfo(line, currentCharIndex, cursorLine, document, convertWithinTemplateString);
    return info.withinBackticks;
  }
  
  /**
   * Check if the current position is in a template string
   */
  static inTemplateString(
    line: string,
    currentCharIndex: number,
    cursorLine: number,
    document: vscode.TextDocument,
    convertWithinTemplateString: boolean
  ): boolean {
    const info = this.getTemplateStringInfo(line, currentCharIndex, cursorLine, document, convertWithinTemplateString);
    return info.inTemplateString;
  }
  
  /**
   * Check if the context is valid for template literal conversion
   */
  static isValidContext(document: vscode.TextDocument, position: vscode.Position): boolean {
    const line = document.lineAt(position.line);
    const text = line.text;
    const charIndex = position.character;
    
    // Check if we're in a comment
    const beforeCursor = text.substring(0, charIndex);
    if (beforeCursor.includes('//') || beforeCursor.includes('/*')) {
      return false;
    }
    
    // Check if we're in an import/require statement
    if (/^\s*(import|require|from)\s+/.test(text)) {
      return false;
    }
    
    // Check if we're in a regex pattern
    const regexMatch = text.match(/\/([^/\n]*)\/[gimuy]*/);
    if (regexMatch && charIndex >= regexMatch.index! && charIndex <= regexMatch.index! + regexMatch[0].length) {
      return false;
    }
    
    return true;
  }
}
