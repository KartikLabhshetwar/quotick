import * as assert from 'assert';
import * as vscode from 'vscode';
import { QuoteDetector } from '../../src/quoteDetector';
import { QuoteChar, Position } from '../../src/types';

suite('QuoteDetector Tests', () => {
    test('getQuoteIndex should find quotes correctly', () => {
        // Test finding first quote
        const line1 = 'const str = "hello world";';
        const index1 = QuoteDetector.getQuoteIndex(line1, '"', 'start', true);
        assert.strictEqual(index1, 12); // Position of opening quote
        
        // Test finding last quote
        const index2 = QuoteDetector.getQuoteIndex(line1, '"', 'end', false);
        assert.strictEqual(index1, 12); // Position of closing quote
        
        // Test with both quotes
        const line2 = 'const str = "hello" + \'world\';';
        const index3 = QuoteDetector.getQuoteIndex(line2, 'both', 'start', true);
        assert.strictEqual(index3, 12); // Should find first quote
    });
    
    test('notInComment should detect comments correctly', () => {
        // Not in comment
        const line1 = 'const str = "hello world";';
        assert.strictEqual(QuoteDetector.notInComment(line1, 20, 12, 24), true);
        
        // In comment
        const line2 = 'const str = "hello world"; // comment';
        assert.strictEqual(QuoteDetector.notInComment(line2, 30, 12, 24), false);
        
        // Comment before quotes
        const line3 = '// const str = "hello world";';
        assert.strictEqual(QuoteDetector.notInComment(line3, 20, 12, 24), true);
    });
    
    test('quotesMatch should detect matching quotes', () => {
        const line1 = 'const str = "hello world";';
        assert.strictEqual(QuoteDetector.quotesMatch(line1, 12, 24), true);
        
        const line2 = 'const str = "hello world\';';
        assert.strictEqual(QuoteDetector.quotesMatch(line2, 12, 24), false);
    });
});
