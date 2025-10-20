import * as vscode from 'vscode';
import * as assert from 'assert';
import { QuoteConverter } from '../../src/converter';

suite('QuoteConverter Tests', () => {
    test('should detect backticks in content', () => {
        const content = 'Hello `world` ${name}';
        const hasBackticks = QuoteConverter.hasBackticks(content);
        
        assert.equal(hasBackticks, true);
    });
    
    test('should not detect backticks when none present', () => {
        const content = 'Hello world ${name}';
        const hasBackticks = QuoteConverter.hasBackticks(content);
        
        assert.equal(hasBackticks, false);
    });
    
    test('should detect template literal syntax', () => {
        const content = 'Hello ${name} world';
        const hasTemplate = QuoteConverter.hasTemplateLiteral(content);
        
        assert.equal(hasTemplate, true);
    });
    
    test('should not detect template literal when none present', () => {
        const content = 'Hello world';
        const hasTemplate = QuoteConverter.hasTemplateLiteral(content);
        
        assert.equal(hasTemplate, false);
    });
    
    test('should find template literals with regex', () => {
        const text = 'const message = "Hello ${name}"; const greeting = \'Welcome ${user}!\';';
        const templateLiterals = text.match(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g);
        
        assert.ok(templateLiterals);
        assert.equal(templateLiterals!.length, 2);
    });
});
