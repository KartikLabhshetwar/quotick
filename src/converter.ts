import * as vscode from 'vscode';

export interface QuoteRange {
    start: vscode.Position;
    end: vscode.Position;
    quoteType: '"' | "'";
    content: string;
}

export class QuoteConverter {
    /**
     * Find if the cursor is inside a quoted string
     */
    static findQuoteRange(document: vscode.TextDocument, position: vscode.Position): QuoteRange | null {
        const text = document.getText();
        const offset = document.offsetAt(position);
        
        // Look backwards from cursor to find opening quote
        let quoteStart = -1;
        let quoteType: '"' | "'" | null = null;
        
        for (let i = offset - 1; i >= 0; i--) {
            const char = text[i];
            
            // Skip escaped characters
            if (char === '\\') {
                i--; // Skip the escaped character
                continue;
            }
            
            // Found a quote
            if (char === '"' || char === "'") {
                quoteType = char as '"' | "'";
                quoteStart = i;
                break;
            }
            
            // Stop at line breaks or other delimiters
            if (char === '\n' || char === '\r') {
                break;
            }
        }
        
        if (quoteStart === -1 || !quoteType) {
            return null;
        }
        
        // Look forwards to find closing quote
        let quoteEnd = -1;
        for (let i = offset; i < text.length; i++) {
            const char = text[i];
            
            // Skip escaped characters
            if (char === '\\') {
                i++; // Skip the escaped character
                continue;
            }
            
            // Found closing quote
            if (char === quoteType) {
                quoteEnd = i;
                break;
            }
            
            // Stop at line breaks
            if (char === '\n' || char === '\r') {
                break;
            }
        }
        
        if (quoteEnd === -1) {
            return null;
        }
        
        const startPos = document.positionAt(quoteStart);
        const endPos = document.positionAt(quoteEnd);
        const content = text.substring(quoteStart + 1, quoteEnd);
        
        return {
            start: startPos,
            end: endPos,
            quoteType,
            content
        };
    }
    
    /**
     * Check if string contains backticks
     */
    static hasBackticks(content: string): boolean {
        return content.includes('`');
    }
    
    /**
     * Check if string contains template literal syntax ${}
     */
    static hasTemplateLiteral(content: string): boolean {
        return /\$\{[^}]*\}/.test(content);
    }
    
    /**
     * Convert quotes to backticks
     */
    static convertToBacktick(document: vscode.TextDocument, quoteRange: QuoteRange): vscode.WorkspaceEdit {
        const edit = new vscode.WorkspaceEdit();
        
        // Replace opening quote with backtick
        edit.replace(document.uri, new vscode.Range(quoteRange.start, quoteRange.start.translate(0, 1)), '`');
        
        // Replace closing quote with backtick
        edit.replace(document.uri, new vscode.Range(quoteRange.end, quoteRange.end.translate(0, 1)), '`');
        
        return edit;
    }
    
    /**
     * Check if the current position is in a valid context for conversion
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
        const regexMatch = text.match(/\/([^\/\n]*)\/[gimuy]*/);
        if (regexMatch && charIndex >= regexMatch.index! && charIndex <= regexMatch.index! + regexMatch[0].length) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Find all template literals in quotes in the document
     */
    static findAllTemplateLiterals(document: vscode.TextDocument): QuoteRange[] {
        const results: QuoteRange[] = [];
        const text = document.getText();
        
        // Find all quoted strings
        const quoteRegex = /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g;
        let match;
        
        while ((match = quoteRegex.exec(text)) !== null) {
            const quoteType = match[1] as '"' | "'";
            const content = match[2];
            
            // Skip if contains backticks or no template literals
            if (this.hasBackticks(content) || !this.hasTemplateLiteral(content)) {
                continue;
            }
            
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length - 1);
            
            // Check if in valid context
            if (!this.isValidContext(document, startPos)) {
                continue;
            }
            
            results.push({
                start: startPos,
                end: endPos,
                quoteType,
                content
            });
        }
        
        return results;
    }
}
