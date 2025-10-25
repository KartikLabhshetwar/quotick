import * as vscode from "vscode";
import { JSXDetector, JSXAttributeInfo } from "./jsxDetector";
import { ConversionResult } from "./types";

/**
 * AttributeHandler class responsible for managing JSX attribute value wrapping/unwrapping
 * Follows Single Responsibility Principle - only handles attribute value manipulation
 */
export class AttributeHandler {
  /**
   * Handle JSX attribute value conversion based on interpolation detection
   */
  static handleJSXAttributeConversion(
    document: vscode.TextDocument,
    position: vscode.Position,
    typedCharacter: string
  ): ConversionResult | null {
    // Check if we're in a valid JSX context
    if (!JSXDetector.isValidJSXContext(document, position)) {
      return null;
    }

    // Get JSX attribute information
    const attributeInfo = JSXDetector.getJSXAttributeInfo(document, position);
    if (!attributeInfo) {
      return null;
    }

    console.log('JSX Attribute Info:', {
      attributeName: attributeInfo.attributeName,
      attributeValue: attributeInfo.attributeValue,
      hasInterpolation: attributeInfo.hasInterpolation,
      isWrappedInBackticks: attributeInfo.isWrappedInBackticks,
      isWrappedInBraces: attributeInfo.isWrappedInBraces,
      typedCharacter
    });

    // Check if we're typing inside backticks
    if (attributeInfo.isWrappedInBackticks) {
      // Check if we just typed ${ inside backticks
      if (typedCharacter === '{') {
        const line = document.lineAt(position.line);
        const text = line.text;
        const charIndex = position.character;
        
        // Check if we just typed ${ 
        const beforeText = text.substring(Math.max(0, charIndex - 2), charIndex);
        if (beforeText === '${') {
          console.log('Triggering conversion for ${ pattern');
          return this.convertBackticksToBraces(document, attributeInfo);
        }
      }
      
      // Also trigger on } completion
      if (typedCharacter === '}') {
        console.log('Triggering conversion for } completion');
        return this.convertBackticksToBraces(document, attributeInfo);
      }
      
      // If we already have interpolation in backticks, convert immediately
      if (attributeInfo.hasInterpolation) {
        console.log('Triggering conversion for existing interpolation');
        return this.convertBackticksToBraces(document, attributeInfo);
      }
    }

    // Check if the attribute value has interpolation
    if (!JSXDetector.hasInterpolation(attributeInfo.attributeValue)) {
      return null;
    }

    // If it has interpolation and is wrapped in backticks, convert to braces
    if (attributeInfo.isWrappedInBackticks) {
      return this.convertBackticksToBraces(document, attributeInfo);
    }

    // If it has interpolation but is not wrapped in braces, wrap it
    if (!attributeInfo.isWrappedInBraces) {
      return this.wrapAttributeValueInBraces(document, attributeInfo);
    }

    return null;
  }

  /**
   * Convert backticks to braces for JSX attribute values with interpolation
   */
  private static convertBackticksToBraces(
    document: vscode.TextDocument,
    attributeInfo: JSXAttributeInfo
  ): ConversionResult {
    try {
      const edit = new vscode.WorkspaceEdit();
      
      // Find the actual backtick positions in the document
      const line = document.lineAt(attributeInfo.startPosition.line);
      const lineText = line.text;
      
      // Find the attribute value boundaries (including backticks)
      const attributePattern = new RegExp(
        `\\b${attributeInfo.attributeName}\\s*=\\s*\`([^\`]*)\``,
        'g'
      );
      
      let match;
      let attributeStart = -1;
      
      while ((match = attributePattern.exec(lineText)) !== null) {
        const matchStart = match.index;
        const matchEnd = match.index + match[0].length;
        
        // Check if our position is within this match
        if (attributeInfo.startPosition.character >= matchStart && 
            attributeInfo.endPosition.character <= matchEnd) {
          attributeStart = matchStart;
          break;
        }
      }
      
      if (attributeStart === -1) {
        return {
          success: false,
          error: 'Could not find attribute boundaries'
        };
      }
      
      // Calculate positions for the edit
      const backtickStartPos = new vscode.Position(attributeInfo.startPosition.line, attributeStart + match![0].indexOf('`'));
      const backtickEndPos = new vscode.Position(attributeInfo.startPosition.line, attributeStart + match![0].lastIndexOf('`'));
      
      // Replace opening backtick with opening brace
      edit.replace(
        document.uri,
        new vscode.Range(backtickStartPos, backtickStartPos.translate(0, 1)),
        '{'
      );
      
      // Replace closing backtick with closing brace
      edit.replace(
        document.uri,
        new vscode.Range(backtickEndPos, backtickEndPos.translate(0, 1)),
        '}'
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
   * Wrap JSX attribute value in braces when interpolation is detected
   */
  private static wrapAttributeValueInBraces(
    document: vscode.TextDocument,
    attributeInfo: JSXAttributeInfo
  ): ConversionResult {
    try {
      const edit = new vscode.WorkspaceEdit();
      
      // Find the actual quote positions in the document
      const line = document.lineAt(attributeInfo.startPosition.line);
      const lineText = line.text;
      
      // Find the attribute value boundaries (including quotes)
      const attributePattern = new RegExp(
        `\\b${attributeInfo.attributeName}\\s*=\\s*(["'\`])([^"'\`]*)\\1`,
        'g'
      );
      
      let match;
      let attributeStart = -1;
      let quoteChar = '';
      
      while ((match = attributePattern.exec(lineText)) !== null) {
        const matchStart = match.index;
        const matchEnd = match.index + match[0].length;
        
        // Check if our position is within this match
        if (attributeInfo.startPosition.character >= matchStart && 
            attributeInfo.endPosition.character <= matchEnd) {
          attributeStart = matchStart;
          quoteChar = match[1];
          break;
        }
      }
      
      if (attributeStart === -1) {
        return {
          success: false,
          error: 'Could not find attribute boundaries'
        };
      }
      
      // Calculate positions for the edit
      const quoteStartPos = new vscode.Position(attributeInfo.startPosition.line, attributeStart + match![0].indexOf(quoteChar));
      const quoteEndPos = new vscode.Position(attributeInfo.startPosition.line, attributeStart + match![0].lastIndexOf(quoteChar));
      
      // Replace opening quote with opening brace
      edit.replace(
        document.uri,
        new vscode.Range(quoteStartPos, quoteStartPos.translate(0, 1)),
        '{'
      );
      
      // Replace closing quote with closing brace
      edit.replace(
        document.uri,
        new vscode.Range(quoteEndPos, quoteEndPos.translate(0, 1)),
        '}'
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
   * Remove unnecessary braces from JSX attribute value when it's a plain string
   */
  static removeUnnecessaryBraces(
    document: vscode.TextDocument,
    position: vscode.Position
  ): ConversionResult | null {
    // Check if we're in a valid JSX context
    if (!JSXDetector.isValidJSXContext(document, position)) {
      return null;
    }

    // Get JSX attribute information
    const attributeInfo = JSXDetector.getJSXAttributeInfo(document, position);
    if (!attributeInfo) {
      return null;
    }

    // Check if the attribute value is wrapped in braces but has no interpolation
    if (attributeInfo.isWrappedInBraces && !JSXDetector.hasInterpolation(attributeInfo.attributeValue)) {
      return this.unwrapAttributeValueFromBraces(document, attributeInfo);
    }

    return null;
  }

  /**
   * Unwrap JSX attribute value from braces when it's a plain string
   */
  private static unwrapAttributeValueFromBraces(
    document: vscode.TextDocument,
    attributeInfo: JSXAttributeInfo
  ): ConversionResult {
    try {
      const edit = new vscode.WorkspaceEdit();
      
      // Find the actual brace positions in the document
      const line = document.lineAt(attributeInfo.startPosition.line);
      const lineText = line.text;
      
      // Find the attribute value boundaries (including braces)
      const attributePattern = new RegExp(
        `\\b${attributeInfo.attributeName}\\s*=\\s*\\{([^}]*)\\}`,
        'g'
      );
      
      let match;
      let attributeStart = -1;
      
      while ((match = attributePattern.exec(lineText)) !== null) {
        const matchStart = match.index;
        const matchEnd = match.index + match[0].length;
        
        // Check if our position is within this match
        if (attributeInfo.startPosition.character >= matchStart && 
            attributeInfo.endPosition.character <= matchEnd) {
          attributeStart = matchStart;
          break;
        }
      }
      
      if (attributeStart === -1) {
        return {
          success: false,
          error: 'Could not find attribute boundaries'
        };
      }
      
      // Calculate positions for the edit
      const braceStartPos = new vscode.Position(attributeInfo.startPosition.line, attributeStart + match![0].indexOf('{'));
      const braceEndPos = new vscode.Position(attributeInfo.startPosition.line, attributeStart + match![0].lastIndexOf('}'));
      
      // Replace opening brace with quote
      edit.replace(
        document.uri,
        new vscode.Range(braceStartPos, braceStartPos.translate(0, 1)),
        '"'
      );
      
      // Replace closing brace with quote
      edit.replace(
        document.uri,
        new vscode.Range(braceEndPos, braceEndPos.translate(0, 1)),
        '"'
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
   * Check if a position change should trigger JSX attribute conversion
   */
  static shouldTriggerConversion(
    document: vscode.TextDocument,
    position: vscode.Position,
    typedCharacter: string
  ): boolean {
    // Only trigger on '}' character
    if (typedCharacter !== '}') {
      return false;
    }

    // Check if we're in JSX context
    if (!JSXDetector.isValidJSXContext(document, position)) {
      return false;
    }

    // Check if we're in a JSX attribute
    const attributeInfo = JSXDetector.getJSXAttributeInfo(document, position);
    if (!attributeInfo) {
      return false;
    }

    // Check if the attribute value has interpolation
    return JSXDetector.hasInterpolation(attributeInfo.attributeValue);
  }

  /**
   * Get the current attribute value content for analysis
   */
  static getCurrentAttributeValue(
    document: vscode.TextDocument,
    position: vscode.Position
  ): string | null {
    const attributeInfo = JSXDetector.getJSXAttributeInfo(document, position);
    return attributeInfo?.attributeValue ?? null;
  }
}
