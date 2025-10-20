import * as assert from 'assert';
import * as vscode from 'vscode';
import { QuoteConverter } from '../../src/converter';
import { QuoteRange } from '../../src/types';

suite('QuoteConverter Tests', () => {
    test('convertToBackticks should create correct edit', () => {
        // Mock document
        const mockDocument = {
            uri: vscode.Uri.file('/test.js')
        } as vscode.TextDocument;
        
        const quoteRange: QuoteRange = {
            start: new vscode.Position(0, 12),
            end: new vscode.Position(0, 24),
            quoteType: '"',
            content: 'hello world',
            lineNumber: 0
        };
        
        const result = QuoteConverter.convertToBackticks(mockDocument, quoteRange);
        
        assert.strictEqual(result.success, true);
        assert.ok(result.edit);
        
        // Check that the edit contains the correct replacements
        const edits = result.edit!.get(mockDocument.uri);
        assert.ok(edits);
        assert.strictEqual(edits.length, 2);
        
        // First edit should replace opening quote with backtick
        assert.strictEqual(edits[0].newText, '`');
        assert.strictEqual(edits[0].range.start.character, 12);
        
        // Second edit should replace closing quote with backtick
        assert.strictEqual(edits[1].newText, '`');
        assert.strictEqual(edits[1].range.start.character, 24);
    });
    
    test('convertBackticksToQuotes should create correct edit', () => {
        // Mock document
        const mockDocument = {
            uri: vscode.Uri.file('/test.js')
        } as vscode.TextDocument;
        
        const quoteRange: QuoteRange = {
            start: new vscode.Position(0, 12),
            end: new vscode.Position(0, 24),
            quoteType: '`',
            content: 'hello world',
            lineNumber: 0
        };
        
        const result = QuoteConverter.convertBackticksToQuotes(mockDocument, quoteRange, '"');
        
        assert.strictEqual(result.success, true);
        assert.ok(result.edit);
        
        // Check that the edit contains the correct replacements
        const edits = result.edit!.get(mockDocument.uri);
        assert.ok(edits);
        assert.strictEqual(edits.length, 2);
        
        // First edit should replace opening backtick with quote
        assert.strictEqual(edits[0].newText, '"');
        assert.strictEqual(edits[0].range.start.character, 12);
        
        // Second edit should replace closing backtick with quote
        assert.strictEqual(edits[1].newText, '"');
        assert.strictEqual(edits[1].range.start.character, 24);
    });
    
    test('findAllTemplateLiterals should find template literals', () => {
        // Mock document with template literals
        const mockDocument = {
            getText: () => 'const str1 = "hello ${world}"; const str2 = "no template";',
            positionAt: (offset: number) => new vscode.Position(0, offset)
        } as vscode.TextDocument;
        
        const results = QuoteConverter.findAllTemplateLiterals(mockDocument);
        
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].content, 'hello ${world}');
        assert.strictEqual(results[0].hasTemplateSyntax, true);
        assert.strictEqual(results[0].isValidContext, true);
    });
});