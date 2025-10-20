import * as assert from 'assert';
import * as vscode from 'vscode';
import { TemplateLiteralDetector } from '../../src/templateLiteralDetector';

suite('TemplateLiteralDetector Tests', () => {
    test('hasTemplateLiteralSyntax should detect template syntax', () => {
        // Should detect template syntax
        assert.strictEqual(TemplateLiteralDetector.hasTemplateLiteralSyntax('Hello ${name}'), true);
        assert.strictEqual(TemplateLiteralDetector.hasTemplateLiteralSyntax('${user.name}'), true);
        assert.strictEqual(TemplateLiteralDetector.hasTemplateLiteralSyntax('Price: $${amount}'), true);
        
        // Should not detect template syntax
        assert.strictEqual(TemplateLiteralDetector.hasTemplateLiteralSyntax('Hello world'), false);
        assert.strictEqual(TemplateLiteralDetector.hasTemplateLiteralSyntax('$100'), false);
        assert.strictEqual(TemplateLiteralDetector.hasTemplateLiteralSyntax('{object}'), false);
    });
    
    test('hasBackticks should detect backticks', () => {
        // Should detect backticks
        assert.strictEqual(TemplateLiteralDetector.hasBackticks('`hello world`'), true);
        assert.strictEqual(TemplateLiteralDetector.hasBackticks('const str = `template`'), true);
        
        // Should not detect backticks
        assert.strictEqual(TemplateLiteralDetector.hasBackticks('"hello world"'), false);
        assert.strictEqual(TemplateLiteralDetector.hasBackticks("'hello world'"), false);
        assert.strictEqual(TemplateLiteralDetector.hasBackticks('hello world'), false);
    });
    
    test('isValidContext should validate context correctly', () => {
        // Mock document and position for testing
        const mockDocument = {
            lineAt: (line: number) => ({
                text: 'const str = "hello ${world}";'
            })
        } as any;
        
        const position = new vscode.Position(0, 20);
        
        // Should be valid context
        assert.strictEqual(TemplateLiteralDetector.isValidContext(mockDocument, position), true);
        
        // Test with comment
        const mockDocumentComment = {
            lineAt: (line: number) => ({
                text: '// const str = "hello ${world}";'
            })
        } as any;
        
        assert.strictEqual(TemplateLiteralDetector.isValidContext(mockDocumentComment, position), false);
    });
});
