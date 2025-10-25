import * as vscode from "vscode";

/**
 * Simplified JSX Backtick Converter
 * Focuses specifically on converting backticks to braces in JSX attributes with interpolation
 */
export class JSXBacktickConverter {
  private static readonly JSX_BACKTICK_ATTRIBUTE_REGEX = /(\w+)\s*=\s*`([^`]*)`/g;
  private static readonly INTERPOLATION_REGEX = /\$\{[^}]*\}/;

  /**
   * Check if the document language supports JSX
   */
  static isJSXSupportedLanguage(languageId: string): boolean {
    return ['javascriptreact', 'typescriptreact', 'jsx', 'tsx'].includes(languageId);
  }

  /**
   * Check if a position is within a JSX backtick attribute with interpolation
   */
  static isInJSXBacktickAttributeWithInterpolation(
    document: vscode.TextDocument, 
    position: vscode.Position
  ): boolean {
    if (!this.isJSXSupportedLanguage(document.languageId)) {
      return false;
    }

    const line = document.lineAt(position.line);
    const text = line.text;
    const charIndex = position.character;

    // Reset regex
    this.JSX_BACKTICK_ATTRIBUTE_REGEX.lastIndex = 0;
    let match;

    while ((match = this.JSX_BACKTICK_ATTRIBUTE_REGEX.exec(text)) !== null) {
      const attributeStart = match.index;
      const attributeEnd = match.index + match[0].length;
      
      // Check if cursor is within this backtick attribute
      if (charIndex >= attributeStart && charIndex <= attributeEnd) {
        const attributeName = match[1];
        const attributeValue = match[2]; // Content inside backticks
        
        // Only trigger for specific JSX attributes (className, class, id, src, alt, etc.)
        const validJSXAttributes = ['className', 'class', 'id', 'src', 'alt', 'href', 'title', 'aria-label', 'data-testid'];
        
        if (validJSXAttributes.includes(attributeName) && this.INTERPOLATION_REGEX.test(attributeValue)) {
          // Additional check: ensure we're actually inside a JSX element
          const beforeAttribute = text.substring(0, attributeStart);
          const jsxTagMatch = beforeAttribute.match(/<[A-Za-z][A-Za-z0-9]*\s*[^>]*$/);
          
          if (jsxTagMatch) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Get the backtick attribute range that needs conversion
   */
  static getBacktickAttributeRange(
    document: vscode.TextDocument, 
    position: vscode.Position
  ): { start: vscode.Position; end: vscode.Position; attributeName: string } | null {
    const line = document.lineAt(position.line);
    const text = line.text;
    const charIndex = position.character;

    // Reset regex
    this.JSX_BACKTICK_ATTRIBUTE_REGEX.lastIndex = 0;
    let match;

    while ((match = this.JSX_BACKTICK_ATTRIBUTE_REGEX.exec(text)) !== null) {
      const attributeStart = match.index;
      const attributeEnd = match.index + match[0].length;
      
      // Check if cursor is within this backtick attribute
      if (charIndex >= attributeStart && charIndex <= attributeEnd) {
        const attributeName = match[1];
        const attributeValue = match[2];
        
        // Only trigger for specific JSX attributes (className, class, id, src, alt, etc.)
        const validJSXAttributes = ['className', 'class', 'id', 'src', 'alt', 'href', 'title', 'aria-label', 'data-testid'];
        
        if (validJSXAttributes.includes(attributeName) && this.INTERPOLATION_REGEX.test(attributeValue)) {
          // Additional check: ensure we're actually inside a JSX element
          const beforeAttribute = text.substring(0, attributeStart);
          const jsxTagMatch = beforeAttribute.match(/<[A-Za-z][A-Za-z0-9]*\s*[^>]*$/);
          
          if (jsxTagMatch) {
            return {
              start: new vscode.Position(position.line, attributeStart),
              end: new vscode.Position(position.line, attributeEnd),
              attributeName
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Convert backticks to braces with backticks for JSX attribute
   */
  static convertBackticksToBraces(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.WorkspaceEdit | null {
    const range = this.getBacktickAttributeRange(document, position);
    if (!range) {
      return null;
    }

    const line = document.lineAt(position.line);
    const text = line.text;
    
    // Find the backtick positions
    const attributeText = text.substring(range.start.character, range.end.character);
    const backtickStart = attributeText.indexOf('`');
    const backtickEnd = attributeText.lastIndexOf('`');
    
    if (backtickStart === -1 || backtickEnd === -1) {
      return null;
    }

    const edit = new vscode.WorkspaceEdit();
    
    // Replace opening backtick with opening brace + backtick
    const openingBacktickPos = new vscode.Position(
      position.line, 
      range.start.character + backtickStart
    );
    edit.replace(
      document.uri,
      new vscode.Range(openingBacktickPos, openingBacktickPos.translate(0, 1)),
      '{`'
    );
    
    // Replace closing backtick with closing backtick + brace
    const closingBacktickPos = new vscode.Position(
      position.line, 
      range.start.character + backtickEnd
    );
    edit.replace(
      document.uri,
      new vscode.Range(closingBacktickPos, closingBacktickPos.translate(0, 1)),
      '`}'
    );

    return edit;
  }

  /**
   * Check if we should trigger conversion based on typed character
   */
  static shouldTriggerConversion(
    document: vscode.TextDocument,
    position: vscode.Position,
    typedCharacter: string
  ): boolean {
    // Only trigger on specific characters
    if (!['{', '}'].includes(typedCharacter)) {
      return false;
    }

    // Check if we're in a JSX backtick attribute with interpolation
    return this.isInJSXBacktickAttributeWithInterpolation(document, position);
  }
}
