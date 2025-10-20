# QuickTick Extension - Installation Guide

## How to Install and Test the Extension

### Method 1: Install from VSIX (Recommended)

1. **Package the extension:**
   ```bash
   cd quicktick-extension
   npm install -g vsce
   vsce package
   ```

2. **Install in VS Code:**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Click the "..." menu and select "Install from VSIX..."
   - Select the generated `.vsix` file

### Method 2: Development Mode

1. **Open the extension folder in VS Code:**
   ```bash
   cd quicktick-extension
   code .
   ```

2. **Run the extension:**
   - Press F5 to launch Extension Development Host
   - A new VS Code window will open with the extension loaded

3. **Test the extension:**
   - Open the `test-example.js` file
   - Try typing `${}` inside quoted strings
   - Use Command Palette (Ctrl+Shift+P) to run QuickTick commands

## Testing the Extension

### Real-time Conversion Test

1. Open a JavaScript/TypeScript file
2. Type a quoted string: `const msg = "Hello ";`
3. Position cursor inside the quotes
4. Type `${name}` - the quotes should automatically convert to backticks
5. Result: `const msg = `Hello ${name}`;`

### Manual Conversion Test

1. Open a file with existing template literals in quotes
2. Use Command Palette (Ctrl+Shift+P)
3. Run "QuickTick: Convert Existing Template Literals"
4. Confirm the conversion

### Configuration Test

1. Open Settings (Ctrl+,)
2. Search for "QuickTick"
3. Toggle settings like "Enable Auto Convert" and "Show Notifications"
4. Test the behavior changes

## Troubleshooting

### Extension Not Working

1. Check if the extension is activated (look for QuickTick in Extensions)
2. Ensure you're in a supported file type (.js, .ts, .jsx, .tsx)
3. Check VS Code Developer Console for errors (Help > Toggle Developer Tools)

### Conversion Not Triggering

1. Make sure you're typing the complete `${}` sequence
2. Verify the string doesn't already contain backticks
3. Check that you're not in a comment or import statement
4. Ensure auto-convert is enabled in settings

### Commands Not Available

1. Reload VS Code window (Ctrl+Shift+P > "Developer: Reload Window")
2. Check if extension is properly installed
3. Verify the extension is activated for the current language

## Features Summary

- ✅ Real-time conversion when typing `${}`
- ✅ Batch conversion commands
- ✅ Smart context detection
- ✅ Configurable settings
- ✅ Support for JS/TS/JSX/TSX files
- ✅ Edge case handling (comments, imports, regex, etc.)
- ✅ Skip conversion if backticks already present
