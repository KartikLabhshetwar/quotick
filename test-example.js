// Test file for QuickTick extension
// Try typing ${} inside the quoted strings below

const message = "Hello world";
const greeting = 'Welcome to our app';

// These should convert when you type ${} inside them:
const template1 = "User: ${username}";
const template2 = 'Status: ${status}';

// This should NOT convert (already has backticks):
const template3 = "Mixed `backticks` and ${variables}";

// This should NOT convert (no template literals):
const regular = "Just a regular string";

// This should NOT convert (in comment):
// const commented = "Commented ${out}";

// This should NOT convert (import statement):
import { something } from "path/to/module";

// Multi-line example:
const multiline = "This is a multi-line string with ${variables}";

// JSX example (if in .jsx/.tsx file):
const jsxElement = <div className="container">Hello ${name}</div>;

const test = "hello ${name}"
