# QuickTick - Template Literal Converter

A VS Code extension that automatically converts quotes to backticks when typing template literals in JavaScript, TypeScript, JSX, and TSX files.

## Features

- **Real-time Conversion**: Automatically converts quotes to backticks when you type `${}` inside a quoted string
- **Smart Detection**: Only converts when appropriate (skips strings with existing backticks)
- **Context Awareness**: Avoids converting in comments, imports, regex patterns, and other invalid contexts
- **Batch Conversion**: Convert existing template literals in current document or entire workspace
- **Configurable**: Customize behavior through VS Code settings

## How It Works

1. **Auto-Conversion**: When you type `${}` inside a quoted string, QuickTick automatically converts the quotes to backticks
2. **Manual Conversion**: Use commands to scan and convert existing template literals

### Examples

**Before (typing `${}` inside quotes):**
```javascript
const message = "Hello ${name}";
const greeting = 'Welcome ${user}!';
```

**After (automatic conversion):**
```javascript
const message = `Hello ${name}`;
const greeting = `Welcome ${user}!`;
```

## Commands

- `QuickTick: Convert Existing Template Literals` - Scan and convert template literals in the current document
- `QuickTick: Convert Template Literals in Workspace` - Scan and convert template literals in all supported files
- `QuickTick: Toggle Auto-Convert` - Enable/disable automatic conversion

## Configuration

Configure QuickTick through VS Code settings:

```json
{
  "quicktick.enableAutoConvert": true,
  "quicktick.showNotifications": true,
  "quicktick.supportedLanguages": [
    "javascript",
    "typescript", 
    "javascriptreact",
    "typescriptreact"
  ],
  "quicktick.showWelcomeMessage": true
}
```

### Settings

- `enableAutoConvert` - Enable/disable automatic conversion (default: `true`)
- `showNotifications` - Show notifications when conversions are made (default: `true`)
- `supportedLanguages` - File types to monitor for conversions (default: `["javascript", "typescript", "javascriptreact", "typescriptreact"]`)
- `showWelcomeMessage` - Show welcome message when extension is activated (default: `true`)

## Supported Languages

- JavaScript (`.js`)
- TypeScript (`.ts`)
- JavaScript React (`.jsx`)
- TypeScript React (`.tsx`)

## Edge Cases Handled

- **Existing Backticks**: Skips conversion if the string already contains backticks
- **Comments**: Ignores strings in comments
- **Import/Require Statements**: Never converts module paths
- **Regex Patterns**: Avoids converting quoted patterns in regular expressions
- **JSX Attributes**: Handles JSX string props correctly
- **Multi-line Strings**: Supports multi-line quoted strings
- **Escaped Characters**: Properly handles escaped quotes and characters

## Installation

1. Install the extension from the VS Code marketplace
2. Open a JavaScript/TypeScript file
3. Start typing template literals with quotes!

## Development

### Prerequisites

- Node.js
- npm
- VS Code

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile TypeScript:
   ```bash
   npm run compile
   ```
4. Press F5 to run the extension in a new Extension Development Host window

### Testing

Run tests with:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

Apache 2.0 License - see [LICENSE](LICENSE) file for details
