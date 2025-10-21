import * as vscode from "vscode";

export class SvelteDetector {
  /**
   * Check if the cursor position is within a <script> tag in a Svelte file
   * This prevents the extension from triggering on HTML template parts
   */
  static isWithinScriptTag(
    document: vscode.TextDocument,
    position: vscode.Position
  ): boolean {
    // Only check for Svelte files
    if (document.languageId !== 'svelte') {
      return true; // For non-Svelte files, assume we're in a valid context
    }

    const lineNumber = position.line;
    const charIndex = position.character;
    
    // Get the full document text to analyze script tag boundaries
    const fullText = document.getText();
    const lines = fullText.split('\n');
    
    // Find all script tags and their positions
    const scriptTags = this.findScriptTags(lines);
    
    // Check if the current position is within any script tag
    for (const scriptTag of scriptTags) {
      if (this.isPositionWithinScriptTag(lineNumber, charIndex, scriptTag)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Find all <script> tags in the document and return their boundaries
   */
  private static findScriptTags(lines: string[]): ScriptTagInfo[] {
    const scriptTags: ScriptTagInfo[] = [];
    let currentScriptTag: ScriptTagInfo | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for opening script tag
      const scriptTagMatch = line.match(/<script(?:\s+[^>]*)?>/i);
      if (scriptTagMatch && !currentScriptTag) {
        const tagStart = line.indexOf('<script');
        const tagEnd = line.indexOf('>', tagStart);
        
        // Check if it's a self-closing tag
        if (line.includes('/>')) {
          // Self-closing script tag - skip it
          continue;
        }
        
        currentScriptTag = {
          startLine: i,
          startChar: tagStart,
          endLine: i,
          endChar: tagEnd,
          isTypeScript: this.isTypeScriptScriptTag(line)
        };
      }
      
      // Look for closing script tag
      if (currentScriptTag && line.includes('</script>')) {
        const closingTagStart = line.indexOf('</script>');
        currentScriptTag.endLine = i;
        currentScriptTag.endChar = closingTagStart + 9; // Length of '</script>'
        
        scriptTags.push(currentScriptTag);
        currentScriptTag = null;
      }
    }
    
    return scriptTags;
  }

  /**
   * Check if a script tag is TypeScript (has lang="ts" or lang="typescript")
   */
  private static isTypeScriptScriptTag(scriptTagLine: string): boolean {
    const langMatch = scriptTagLine.match(/lang\s*=\s*["']([^"']+)["']/i);
    if (langMatch) {
      const lang = langMatch[1].toLowerCase();
      return lang === 'ts' || lang === 'typescript';
    }
    return false;
  }

  /**
   * Check if a position is within a script tag
   */
  private static isPositionWithinScriptTag(
    lineNumber: number,
    charIndex: number,
    scriptTag: ScriptTagInfo
  ): boolean {
    // Check if we're within the script tag boundaries
    if (lineNumber < scriptTag.startLine || lineNumber > scriptTag.endLine) {
      return false;
    }
    
    // If we're on the start line, check if we're after the opening tag
    if (lineNumber === scriptTag.startLine) {
      return charIndex > scriptTag.startChar;
    }
    
    // If we're on the end line, check if we're before the closing tag
    if (lineNumber === scriptTag.endLine) {
      return charIndex < scriptTag.endChar;
    }
    
    // If we're between start and end lines, we're definitely within the script tag
    return true;
  }

  /**
   * Check if the current script tag supports TypeScript
   */
  static isCurrentScriptTagTypeScript(
    document: vscode.TextDocument,
    position: vscode.Position
  ): boolean {
    if (document.languageId !== 'svelte') {
      return false;
    }

    const lines = document.getText().split('\n');
    const scriptTags = this.findScriptTags(lines);
    
    for (const scriptTag of scriptTags) {
      if (this.isPositionWithinScriptTag(position.line, position.character, scriptTag)) {
        return scriptTag.isTypeScript;
      }
    }
    
    return false;
  }
}

interface ScriptTagInfo {
  startLine: number;
  startChar: number;
  endLine: number;
  endChar: number;
  isTypeScript: boolean;
}
