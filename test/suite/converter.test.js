"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const converter_1 = require("../src/converter");
suite('QuoteConverter Tests', () => {
    test('should detect quote range correctly', () => {
        const text = 'const message = "Hello ${name}";';
        const doc = vscode.TextDocument.create('test.js', 'javascript', 1, text);
        const position = new vscode.Position(0, 25); // Inside the string
        const result = converter_1.QuoteConverter.findQuoteRange(doc, position);
        assert.ok(result);
        assert.equal(result.quoteType, '"');
        assert.equal(result.content, 'Hello ${name}');
    });
    test('should detect single quotes', () => {
        const text = "const message = 'Hello ${name}';";
        const doc = vscode.TextDocument.create('test.js', 'javascript', 1, text);
        const position = new vscode.Position(0, 25);
        const result = converter_1.QuoteConverter.findQuoteRange(doc, position);
        assert.ok(result);
        assert.equal(result.quoteType, "'");
        assert.equal(result.content, 'Hello ${name}');
    });
    test('should return null when not in quotes', () => {
        const text = 'const message = "Hello";';
        const doc = vscode.TextDocument.create('test.js', 'javascript', 1, text);
        const position = new vscode.Position(0, 5); // Outside quotes
        const result = converter_1.QuoteConverter.findQuoteRange(doc, position);
        assert.equal(result, null);
    });
    test('should detect backticks in content', () => {
        const content = 'Hello `world` ${name}';
        const hasBackticks = converter_1.QuoteConverter.hasBackticks(content);
        assert.equal(hasBackticks, true);
    });
    test('should not detect backticks when none present', () => {
        const content = 'Hello world ${name}';
        const hasBackticks = converter_1.QuoteConverter.hasBackticks(content);
        assert.equal(hasBackticks, false);
    });
    test('should detect template literal syntax', () => {
        const content = 'Hello ${name} world';
        const hasTemplate = converter_1.QuoteConverter.hasTemplateLiteral(content);
        assert.equal(hasTemplate, true);
    });
    test('should not detect template literal when none present', () => {
        const content = 'Hello world';
        const hasTemplate = converter_1.QuoteConverter.hasTemplateLiteral(content);
        assert.equal(hasTemplate, false);
    });
    test('should validate context correctly', () => {
        const text = 'const message = "Hello ${name}";';
        const doc = vscode.TextDocument.create('test.js', 'javascript', 1, text);
        const position = new vscode.Position(0, 20);
        const isValid = converter_1.QuoteConverter.isValidContext(doc, position);
        assert.equal(isValid, true);
    });
    test('should invalidate context in comments', () => {
        const text = '// const message = "Hello ${name}";';
        const doc = vscode.TextDocument.create('test.js', 'javascript', 1, text);
        const position = new vscode.Position(0, 25);
        const isValid = converter_1.QuoteConverter.isValidContext(doc, position);
        assert.equal(isValid, false);
    });
    test('should invalidate context in import statements', () => {
        const text = 'import { something } from "path/to/module";';
        const doc = vscode.TextDocument.create('test.js', 'javascript', 1, text);
        const position = new vscode.Position(0, 30);
        const isValid = converter_1.QuoteConverter.isValidContext(doc, position);
        assert.equal(isValid, false);
    });
});
//# sourceMappingURL=converter.test.js.map