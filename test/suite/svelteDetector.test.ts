import * as assert from 'assert';
import * as vscode from 'vscode';
import { SvelteDetector } from '../../src/svelteDetector';

suite('SvelteDetector Tests', () => {
  test('should detect position within script tag', () => {
    const content = `<script>
let name = "world";
function greet() {
  console.log(\`Hello \${name}!\`);
}
</script>

<div>
  <h1>Hello {name}!</h1>
</div>`;

    const doc = vscode.workspace.openTextDocument({
      content,
      language: 'svelte'
    }).then(document => {
      // Test position within script tag
      const scriptPosition = new vscode.Position(2, 10); // Inside the function
      assert.strictEqual(SvelteDetector.isWithinScriptTag(document, scriptPosition), true);
      
      // Test position outside script tag (in HTML template)
      const templatePosition = new vscode.Position(8, 10); // Inside the div
      assert.strictEqual(SvelteDetector.isWithinScriptTag(document, templatePosition), false);
    });
  });

  test('should detect TypeScript script tag', () => {
    const content = `<script lang="ts">
let name: string = "world";
function greet(name: string): void {
  console.log(\`Hello \${name}!\`);
}
</script>

<div>
  <h1>Hello {name}!</h1>
</div>`;

    const doc = vscode.workspace.openTextDocument({
      content,
      language: 'svelte'
    }).then(document => {
      // Test position within TypeScript script tag
      const scriptPosition = new vscode.Position(2, 10); // Inside the function
      assert.strictEqual(SvelteDetector.isCurrentScriptTagTypeScript(document, scriptPosition), true);
    });
  });

  test('should handle JavaScript script tag', () => {
    const content = `<script>
let name = "world";
function greet() {
  console.log(\`Hello \${name}!\`);
}
</script>

<div>
  <h1>Hello {name}!</h1>
</div>`;

    const doc = vscode.workspace.openTextDocument({
      content,
      language: 'svelte'
    }).then(document => {
      // Test position within JavaScript script tag
      const scriptPosition = new vscode.Position(2, 10); // Inside the function
      assert.strictEqual(SvelteDetector.isCurrentScriptTagTypeScript(document, scriptPosition), false);
    });
  });

  test('should handle self-closing script tags', () => {
    const content = `<script />
<div>
  <h1>Hello world!</h1>
</div>`;

    const doc = vscode.workspace.openTextDocument({
      content,
      language: 'svelte'
    }).then(document => {
      // Test position in template (should not be within script tag)
      const templatePosition = new vscode.Position(2, 10); // Inside the div
      assert.strictEqual(SvelteDetector.isWithinScriptTag(document, templatePosition), false);
    });
  });

  test('should handle non-Svelte files', () => {
    const content = `let name = "world";
function greet() {
  console.log(\`Hello \${name}!\`);
}`;

    const doc = vscode.workspace.openTextDocument({
      content,
      language: 'javascript'
    }).then(document => {
      // For non-Svelte files, should always return true
      const position = new vscode.Position(1, 10);
      assert.strictEqual(SvelteDetector.isWithinScriptTag(document, position), true);
    });
  });
});
