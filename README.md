

<div align="center">
  <h1>Quotick</h1>
  <img src="https://img.shields.io/badge/VS%20Code-Extension-blue?style=for-the-badge&logo=visual-studio-code" alt="VS Code Extension" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript" alt="TypeScript Ready" />
  <img src="https://img.shields.io/badge/JavaScript-Supported-yellow?style=for-the-badge&logo=javascript" alt="JavaScript Supported" />
</div>

<div align="center">
  <h3>Automatically convert quotes to backticks when typing template literals</h3>
  <p>A smart VS Code extension that enhances your JavaScript/TypeScript development workflow by automatically detecting and converting template literal syntax</p>
</div>

---

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Commands](#commands)
- [Configuration](#configuration)
- [Supported Languages](#supported-languages)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Real-time Conversion**: Instantly converts quotes to backticks when you type `${}` inside quoted strings
- **Smart Detection**: Intelligently skips strings that already contain backticks or are in invalid contexts
- **Context Aware**: Avoids conversion in comments, imports, regex patterns, and other inappropriate locations
- **Batch Processing**: Convert existing template literals across your entire workspace
- **Highly Configurable**: Customize behavior through VS Code settings
- **Multi-language Support**: Works with JavaScript, TypeScript, JSX, and TSX files
- **Non-intrusive**: Only activates when needed, preserving your existing workflow

## How It Works

Quotick monitors your typing and automatically converts quotes to backticks when it detects template literal syntax. Here's how:

### Auto-Conversion Example

**Type this:**
```javascript
const message = "Hello ${name}";
const greeting = 'Welcome ${user}!';
```

**Quotick automatically converts to:**
```javascript
const message = `Hello ${name}`;
const greeting = `Welcome ${user}!`;
```

### Smart Context Detection

Quotick intelligently avoids conversion in these scenarios:

- **Comments**: `// const str = "Hello ${world}";`
- **Import statements**: `import { foo } from "module";`
- **Regex patterns**: `const regex = /pattern/;`
- **Existing backticks**: `const str = "Hello `world`";`
- **JSX attributes**: `<Component prop="value" />`

## Commands

Access these commands via the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | Description |
|---------|-------------|
| `Quotick: Toggle Auto-Convert` | Enable/disable automatic conversion |
| `Quotick: Test Conversion` | Manually test conversion on current document |

## Configuration

Configure Quotick through VS Code settings (`Ctrl+,` / `Cmd+,`):

```json
{
  "quotick.enableAutoConvert": true,
  "quotick.showNotifications": true,
  "quotick.supportedLanguages": [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact"
  ],
  "quotick.showWelcomeMessage": true
}
```

### Settings Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `enableAutoConvert` | `boolean` | `true` | Enable/disable automatic conversion |
| `showNotifications` | `boolean` | `true` | Show notifications when conversions are made |
| `supportedLanguages` | `string[]` | `["javascript", "typescript", "javascriptreact", "typescriptreact"]` | File types to monitor |
| `showWelcomeMessage` | `boolean` | `true` | Show welcome message on first activation |

## Supported Languages

- **JavaScript** (`.js`)
- **TypeScript** (`.ts`)
- **JavaScript React** (`.jsx`)
- **TypeScript React** (`.tsx`)

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Quotick"
4. Click Install

### Manual Installation

1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions → Install from VSIX
4. Select the downloaded file

## Quick Start

1. **Install** Quotick from the VS Code marketplace
2. **Open** a JavaScript or TypeScript file
3. **Type** a quoted string with template literal syntax: `"Hello ${name}"`
4. **Watch** Quotick automatically convert it to: `` `Hello ${name}` ``

### Example Usage

```javascript
// Type this:
const message = "Hello ${name}";
const greeting = 'Welcome ${user}!';

// Quotick automatically converts to:
const message = `Hello ${name}`;
const greeting = `Welcome ${user}!`;
```

## Development

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **VS Code** (v1.74 or higher)

### Setup Development Environment

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

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint
```

### Building

Create a production build:

```bash
# Compile TypeScript
npm run compile

# Package extension
npm run package
```

## Contributing

We welcome contributions! Here's how you can help:

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Add** tests for new functionality
5. **Run** the test suite: `npm test`
6. **Commit** your changes: `git commit -m 'Add amazing feature'`
7. **Push** to the branch: `git push origin feature/amazing-feature`
8. **Open** a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting
- Use clear commit messages
- Keep pull requests focused and small

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
