"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const assert = require("assert");
suite('Extension Integration Tests', () => {
    test('should activate extension', async () => {
        const extension = vscode.extensions.getExtension('quicktick');
        assert.ok(extension);
        await extension.activate();
        assert.ok(extension.isActive);
    });
    test('should register commands', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('quicktick.convertExisting'));
        assert.ok(commands.includes('quicktick.convertWorkspace'));
        assert.ok(commands.includes('quicktick.toggleAutoConvert'));
    });
    test('should have configuration properties', () => {
        const config = vscode.workspace.getConfiguration('quicktick');
        assert.ok(config.has('enableAutoConvert'));
        assert.ok(config.has('showNotifications'));
        assert.ok(config.has('supportedLanguages'));
        assert.ok(config.has('showWelcomeMessage'));
    });
});
//# sourceMappingURL=integration.test.js.map