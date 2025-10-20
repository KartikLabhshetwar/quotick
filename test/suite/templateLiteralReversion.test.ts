import * as assert from 'assert';
import * as vscode from 'vscode';
import { DocumentChangeHandler } from '../../src/documentChangeHandler';
import { ConfigurationManager } from '../../src/configuration';

suite('Template Literal Reversion Tests', () => {
    test('should revert backticks to quotes when $ is removed', async () => {
        // Mock document with template literal
        const mockDocument = {
            uri: vscode.Uri.file('/test.js'),
            lineAt: (line: number) => ({
                text: line === 0 ? 'const message = `Hello ${name}`;' : ''
            }),
            getText: (range: vscode.Range) => {
                if (range.start.line === 0 && range.start.character === 15 && range.end.character === 16) {
                    return '$'; // Character before cursor
                }
                return '';
            }
        } as any;

        // Mock previous document state
        const previousDocument = {
            lines: [{
                text: 'const message = `Hello ${name}`;'
            }],
            lineCount: 1
        };

        // Mock configuration
        const mockConfiguration = {
            enabled: true,
            quoteType: 'double',
            autoRemoveTemplateString: true,
            convertOutermostQuotes: true,
            convertWithinTemplateString: true
        };

        // Create handler and test reversion
        const handler = new DocumentChangeHandler();
        
        // Simulate removing the $ character
        const changes = {
            text: '', // Empty text means deletion
            range: new vscode.Range(new vscode.Position(0, 15), new vscode.Position(0, 16)), // Range of $
            rangeOffset: 15,
            rangeLength: 1
        } as vscode.TextDocumentContentChangeEvent;

        // Test the reversion logic
        const result = await (handler as any).handleTemplateLiteralReversion(
            mockDocument,
            0, // line number
            15, // current character position
            changes,
            mockConfiguration
        );

        assert.strictEqual(result, true, 'Should successfully revert backticks to quotes');
    });

    test('should revert backticks to quotes when { is removed', async () => {
        // Mock document with template literal
        const mockDocument = {
            uri: vscode.Uri.file('/test.js'),
            lineAt: (line: number) => ({
                text: line === 0 ? 'const message = `Hello $name`;' : ''
            }),
            getText: (range: vscode.Range) => {
                if (range.start.line === 0 && range.start.character === 16 && range.end.character === 17) {
                    return '{'; // Character before cursor
                }
                return '';
            }
        } as any;

        // Mock previous document state
        const previousDocument = {
            lines: [{
                text: 'const message = `Hello ${name}`;'
            }],
            lineCount: 1
        };

        // Mock configuration
        const mockConfiguration = {
            enabled: true,
            quoteType: 'single',
            autoRemoveTemplateString: true,
            convertOutermostQuotes: true,
            convertWithinTemplateString: true
        };

        // Create handler and test reversion
        const handler = new DocumentChangeHandler();
        
        // Simulate removing the { character
        const changes = {
            text: '', // Empty text means deletion
            range: new vscode.Range(new vscode.Position(0, 16), new vscode.Position(0, 17)), // Range of {
            rangeOffset: 16,
            rangeLength: 1
        } as vscode.TextDocumentContentChangeEvent;

        // Test the reversion logic
        const result = await (handler as any).handleTemplateLiteralReversion(
            mockDocument,
            0, // line number
            16, // current character position
            changes,
            mockConfiguration
        );

        assert.strictEqual(result, true, 'Should successfully revert backticks to quotes when { is removed');
    });

    test('should not revert when template syntax still exists', async () => {
        // Mock document with template literal that still has valid syntax
        const mockDocument = {
            uri: vscode.Uri.file('/test.js'),
            lineAt: (line: number) => ({
                text: line === 0 ? 'const message = `Hello ${name}`;' : ''
            }),
            getText: (range: vscode.Range) => {
                return '';
            }
        } as any;

        // Mock previous document state
        const previousDocument = {
            lines: [{
                text: 'const message = `Hello ${name}`;'
            }],
            lineCount: 1
        };

        // Mock configuration
        const mockConfiguration = {
            enabled: true,
            quoteType: 'double',
            autoRemoveTemplateString: true,
            convertOutermostQuotes: true,
            convertWithinTemplateString: true
        };

        // Create handler and test reversion
        const handler = new DocumentChangeHandler();
        
        // Simulate removing a character that doesn't break template syntax
        const changes = {
            text: '', // Empty text means deletion
            range: new vscode.Range(new vscode.Position(0, 20), new vscode.Position(0, 21)), // Range of 'n' in 'name'
            rangeOffset: 20,
            rangeLength: 1
        } as vscode.TextDocumentContentChangeEvent;

        // Test the reversion logic
        const result = await (handler as any).handleTemplateLiteralReversion(
            mockDocument,
            0, // line number
            20, // current character position
            changes,
            mockConfiguration
        );

        assert.strictEqual(result, false, 'Should not revert when template syntax still exists');
    });

    test('getRemovedCharacter should correctly identify removed characters', () => {
        const handler = new DocumentChangeHandler();
        
        // Test removing $ character
        const previousLine = 'const message = `Hello ${name}`;';
        const currentLine = 'const message = `Hello {name}`;';
        const removedChar = (handler as any).getRemovedCharacter(previousLine, currentLine, 15);
        
        assert.strictEqual(removedChar, '$', 'Should correctly identify $ as removed character');
        
        // Test removing { character
        const previousLine2 = 'const message = `Hello ${name}`;';
        const currentLine2 = 'const message = `Hello $name}`;';
        const removedChar2 = (handler as any).getRemovedCharacter(previousLine2, currentLine2, 16);
        
        assert.strictEqual(removedChar2, '{', 'Should correctly identify { as removed character');
    });
});
