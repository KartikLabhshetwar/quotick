<div align="center">
  <h1>Quotick</h1>
  <img src="https://img.shields.io/badge/VS%20Code-Extension-blue?style=for-the-badge&logo=visual-studio-code" alt="VS Code Extension" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript" alt="TypeScript Ready" />
  <img src="https://img.shields.io/badge/JavaScript-Supported-yellow?style=for-the-badge&logo=javascript" alt="JavaScript Supported" />
</div>

<div align="center">
  <h3>A VS Code extension that automatically converts quotes to backticks when typing template literals and reverts back when template syntax is removed</h3>
</div>

## What it does

![clideo_editor_fa6cd16f8063436e9e4bbd8f40e9eb97](https://github.com/user-attachments/assets/d1ef48b9-1b6a-408c-9093-1a83fabedeaf)


Type this:
```javascript
const message = "Hello ${name}";
const greeting = 'Welcome ${user}!';
```

Quotick automatically converts it to:
```javascript
const message = `Hello ${name}`;
const greeting = `Welcome ${user}!`;
```

**Smart Revert Feature** - When you remove `$` or `{` from template literals, Quotick automatically reverts back to quotes:

```javascript
// Start with: `Hello ${name}`
// Delete $: `Hello {name}` → automatically becomes "Hello {name}"
// Delete {: `Hello $name}` → automatically becomes "Hello $name}"
```

**Svelte Support** - Works seamlessly with Svelte components, only triggering within `<script>` tags:

```svelte
<script lang="ts">
  let name: string = "world";
  const message = "Hello ${name}!"; // ← Converts to backticks
</script>

<div>
  <h1>Hello {name}!</h1> <!-- ← Won't trigger here -->
</div>
```

## Features

| Feature | Description |
|---------|-------------|
| **Auto-conversion** | Converts quotes to backticks when typing `${}` |
| **Smart Revert** | Automatically reverts backticks to quotes when `$` or `{` is removed |
| **Smart detection** | Only converts strings with template literal syntax |
| **Context aware** | Skips comments, imports, and invalid contexts |
| **Multi-language** | Works with JS, TS, JSX, TSX, and Svelte files |
| **Real-time** | Converts as you type |
| **Bidirectional** | Works both ways - quotes ↔ backticks |
| **Configurable** | Enable/disable and customize behavior |

## Installation

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Quotick"
4. Click Install

## Supported Languages

- JavaScript (`.js`)
- TypeScript (`.ts`)
- JavaScript React (`.jsx`)
- TypeScript React (`.tsx`)
- **Svelte (`.svelte`)** - Only triggers within `<script>` tags, not in HTML template parts

## Commands

- `Quotick: Toggle Auto-Convert` - Enable/disable automatic conversion
- `Quotick: Test Conversion` - Manually test conversion on current document
- `Quotick: Toggle Revert Feature` - Enable/disable smart revert functionality

## Configuration

```json
{
  "quotick.enableAutoConvert": true,
  "quotick.showNotifications": true,
  "quotick.autoRemoveTemplateString": true,
  "quotick.supportedLanguages": [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact",
    "svelte"
  ]
}
```

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- VS Code (v1.74 or higher)

### Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/KartikLabhshetwar/quotick.git
   cd quotick
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Compile TypeScript:**
   ```bash
   npm run compile
   ```

4. **Run in development mode:**
   - Press `F5` in VS Code
   - A new Extension Development Host window will open
   - Test your changes in this window

### Testing
```bash
npm test          # Run all tests
npm run lint      # Run linting
```

## License

[Apache 2.0](LICENSE)
