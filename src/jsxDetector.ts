import * as vscode from "vscode";

export interface JSXAttributeInfo {
  isJSXAttribute: boolean;
  attributeName: string;
  attributeValue: string;
  startPosition: vscode.Position;
  endPosition: vscode.Position;
  hasInterpolation: boolean;
  isWrappedInBraces: boolean;
  isWrappedInBackticks: boolean;
}

export interface JSXElementInfo {
  tagName: string;
  isSelfClosing: boolean;
  attributes: JSXAttributeInfo[];
  startPosition: vscode.Position;
  endPosition: vscode.Position;
}

/**
 * JSXDetector class responsible for detecting JSX/TSX contexts and attributes
 * Follows Single Responsibility Principle - only handles JSX detection logic
 */
export class JSXDetector {
  private static readonly JSX_TAG_REGEX = /<([A-Za-z][A-Za-z0-9]*|@[A-Za-z][A-Za-z0-9]*)\s*([^>]*?)(\/?>)/g;
  private static readonly JSX_ATTRIBUTE_REGEX = /(\w+)\s*=\s*([^>\s]+)/g;
  private static readonly JSX_ATTRIBUTE_WITH_BACKTICKS_REGEX = /(\w+)\s*=\s*`([^`]*)`/g;
  private static readonly INTERPOLATION_REGEX = /\$\{[^}]*\}/g;

  /**
   * Check if the document language supports JSX
   */
  static isJSXSupportedLanguage(languageId: string): boolean {
    return ['javascriptreact', 'typescriptreact', 'jsx', 'tsx'].includes(languageId);
  }

  /**
   * Check if a position is within JSX context
   */
  static isWithinJSXContext(document: vscode.TextDocument, position: vscode.Position): boolean {
    if (!this.isJSXSupportedLanguage(document.languageId)) {
      return false;
    }

    const line = document.lineAt(position.line);
    const text = line.text;
    const charIndex = position.character;

    // Check if we're inside JSX tags
    const beforeCursor = text.substring(0, charIndex);

    // Look for JSX opening tags before cursor
    const openTagMatches = Array.from(beforeCursor.matchAll(/<[A-Za-z][A-Za-z0-9]*\s*/g));
    const closeTagMatches = Array.from(beforeCursor.matchAll(/<\/[A-Za-z][A-Za-z0-9]*>/g));

    // Simple check: if we have more opening tags than closing tags, we're likely in JSX
    return openTagMatches.length > closeTagMatches.length;
  }

  /**
   * Check if a position is within a JSX attribute value
   */
  static isWithinJSXAttributeValue(document: vscode.TextDocument, position: vscode.Position): boolean {
    const attributeInfo = this.getJSXAttributeInfo(document, position);
    return attributeInfo?.isJSXAttribute ?? false;
  }

  /**
   * Get detailed information about JSX attribute at a position
   */
  static getJSXAttributeInfo(document: vscode.TextDocument, position: vscode.Position): JSXAttributeInfo | null {
    if (!this.isJSXSupportedLanguage(document.languageId)) {
      return null;
    }

    const line = document.lineAt(position.line);
    const text = line.text;

    // Find JSX elements in the current line
    const jsxElements = this.findJSXElementsInLine(text, position.line);
    
    for (const element of jsxElements) {
      for (const attribute of element.attributes) {
        if (this.isPositionWithinAttribute(position, attribute)) {
          return attribute;
        }
      }
    }

    // If no exact match found, try to detect if we're typing inside backticks
    return this.detectBacktickAttributeAtPosition(document, position);
  }

  /**
   * Detect if we're typing inside a backtick-wrapped JSX attribute
   */
  private static detectBacktickAttributeAtPosition(document: vscode.TextDocument, position: vscode.Position): JSXAttributeInfo | null {
    const line = document.lineAt(position.line);
    const text = line.text;
    const charIndex = position.character;

    // Look for backtick patterns around the current position
    const beforeCursor = text.substring(0, charIndex);
    const afterCursor = text.substring(charIndex);

    // Find the nearest backtick before cursor
    const backtickBefore = beforeCursor.lastIndexOf('`');
    if (backtickBefore === -1) {
      return null;
    }

    // Find the nearest backtick after cursor
    const backtickAfter = afterCursor.indexOf('`');
    if (backtickAfter === -1) {
      return null;
    }

    // Check if we're between backticks
    const textBetweenBackticks = text.substring(backtickBefore + 1, charIndex + backtickAfter);
    
    // Check if this looks like a JSX attribute (className=, id=, etc.)
    // Look for attribute name followed by = and then backtick
    const beforeBacktick = beforeCursor.substring(0, backtickBefore);
    const attributeMatch = beforeBacktick.match(/(\w+)\s*=\s*$/);
    if (!attributeMatch) {
      return null;
    }

    const attributeName = attributeMatch[1];
    
    // Check if we're in a JSX context (look for < before the attribute)
    const jsxTagMatch = beforeBacktick.match(/<[A-Za-z][A-Za-z0-9]*\s*[^>]*$/);
    if (!jsxTagMatch) {
      return null;
    }

    return {
      isJSXAttribute: true,
      attributeName,
      attributeValue: textBetweenBackticks,
      startPosition: new vscode.Position(position.line, backtickBefore),
      endPosition: new vscode.Position(position.line, charIndex + backtickAfter),
      hasInterpolation: this.hasInterpolation(textBetweenBackticks),
      isWrappedInBraces: false,
      isWrappedInBackticks: true
    };
  }

  /**
   * Check if a string contains template literal interpolation
   */
  static hasInterpolation(content: string): boolean {
    return this.INTERPOLATION_REGEX.test(content);
  }

  /**
   * Check if a string is wrapped in braces
   */
  static isWrappedInBraces(content: string): boolean {
    return content.startsWith('{') && content.endsWith('}');
  }

  /**
   * Check if a string is a plain string (no interpolation)
   */
  static isPlainString(content: string): boolean {
    return !this.hasInterpolation(content) && !this.isWrappedInBraces(content);
  }

  /**
   * Find all JSX elements in a line of text
   */
  private static findJSXElementsInLine(text: string, lineNumber: number): JSXElementInfo[] {
    const elements: JSXElementInfo[] = [];
    let match;

    // Reset regex lastIndex
    this.JSX_TAG_REGEX.lastIndex = 0;

    while ((match = this.JSX_TAG_REGEX.exec(text)) !== null) {
      const tagName = match[1];
      const attributesText = match[2];
      const isSelfClosing = match[3].includes('/');
      
      const startPosition = new vscode.Position(lineNumber, match.index);
      const endPosition = new vscode.Position(lineNumber, match.index + match[0].length);

      const attributes = this.parseJSXAttributes(attributesText, lineNumber, match.index);

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

  /**
   * Parse JSX attributes from attribute text
   */
  private static parseJSXAttributes(attributesText: string, lineNumber: number, tagStartIndex: number): JSXAttributeInfo[] {
    const attributes: JSXAttributeInfo[] = [];
    
    // First, check for backtick-wrapped attributes
    let match;
    this.JSX_ATTRIBUTE_WITH_BACKTICKS_REGEX.lastIndex = 0;
    
    while ((match = this.JSX_ATTRIBUTE_WITH_BACKTICKS_REGEX.exec(attributesText)) !== null) {
      const attributeName = match[1];
      const attributeValue = match[2]; // This is the content inside backticks
      
      const startPosition = new vscode.Position(lineNumber, tagStartIndex + match.index);
      const endPosition = new vscode.Position(lineNumber, tagStartIndex + match.index + match[0].length);

      attributes.push({
        isJSXAttribute: true,
        attributeName,
        attributeValue,
        startPosition,
        endPosition,
        hasInterpolation: this.hasInterpolation(attributeValue),
        isWrappedInBraces: false, // Backticks are not braces
        isWrappedInBackticks: true // New property to track backticks
      });
    }
    
    // Then check for regular quoted attributes
    this.JSX_ATTRIBUTE_REGEX.lastIndex = 0;
    
    while ((match = this.JSX_ATTRIBUTE_REGEX.exec(attributesText)) !== null) {
      const attributeName = match[1];
      const attributeValue = match[2];
      
      // Skip if this attribute was already processed as a backtick attribute
      const isBacktickAttribute = attributes.some(attr => 
        attr.attributeName === attributeName && 
        attr.isWrappedInBackticks
      );
      
      if (isBacktickAttribute) {
        continue;
      }
      
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
        hasInterpolation: this.hasInterpolation(cleanValue),
        isWrappedInBraces: this.isWrappedInBraces(cleanValue),
        isWrappedInBackticks: false
      });
    }

    return attributes;
  }

  /**
   * Check if a position is within a specific attribute
   */
  private static isPositionWithinAttribute(position: vscode.Position, attribute: JSXAttributeInfo): boolean {
    return position.line === attribute.startPosition.line &&
           position.character >= attribute.startPosition.character &&
           position.character <= attribute.endPosition.character;
  }

  /**
   * Check if the current context is valid for JSX attribute manipulation
   */
  static isValidJSXContext(document: vscode.TextDocument, position: vscode.Position): boolean {
    if (!this.isJSXSupportedLanguage(document.languageId)) {
      return false;
    }

    const line = document.lineAt(position.line);
    const text = line.text;
    const charIndex = position.character;

    // Check if we're in a comment
    const beforeCursor = text.substring(0, charIndex);
    if (beforeCursor.includes('//') || beforeCursor.includes('/*')) {
      return false;
    }

    // Check if we're in a string literal outside JSX
    if (this.isInStringLiteralOutsideJSX(text, charIndex)) {
      return false;
    }

    return this.isWithinJSXContext(document, position);
  }

  /**
   * Check if position is in a string literal outside JSX context
   */
  private static isInStringLiteralOutsideJSX(text: string, charIndex: number): boolean {
    const beforeCursor = text.substring(0, charIndex);
    const afterCursor = text.substring(charIndex);

    // Look for quote patterns
    const singleQuoteBefore = beforeCursor.lastIndexOf("'");
    const doubleQuoteBefore = beforeCursor.lastIndexOf('"');
    const backtickBefore = beforeCursor.lastIndexOf('`');

    const singleQuoteAfter = afterCursor.indexOf("'");
    const doubleQuoteAfter = afterCursor.indexOf('"');
    const backtickAfter = afterCursor.indexOf('`');

    // Check if we're between matching quotes
    const lastQuoteBefore = Math.max(singleQuoteBefore, doubleQuoteBefore, backtickBefore);
    const firstQuoteAfter = Math.min(
      singleQuoteAfter === -1 ? Infinity : singleQuoteAfter,
      doubleQuoteAfter === -1 ? Infinity : doubleQuoteAfter,
      backtickAfter === -1 ? Infinity : backtickAfter
    );

    if (lastQuoteBefore !== -1 && firstQuoteAfter !== Infinity) {
      const quoteChar = text.charAt(lastQuoteBefore);
      return quoteChar === text.charAt(charIndex + firstQuoteAfter);
    }

    return false;
  }
}
