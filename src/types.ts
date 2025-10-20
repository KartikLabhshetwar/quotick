import * as vscode from "vscode";

export type QuoteType = "both" | "single" | "double";
export type QuoteChar = "both" | `'` | `"` | '`';
export type Position = "start" | "end";

export interface ExtensionConfiguration {
  enabled: boolean;
  quoteType: QuoteType;
  validLanguages: string[];
  addBracketsToProps: boolean;
  autoRemoveTemplateString: boolean;
  convertOutermostQuotes: boolean;
  convertWithinTemplateString: boolean;
  filesExcluded: string[] | { [key: string]: boolean };
}

export interface QuoteRange {
  start: vscode.Position;
  end: vscode.Position;
  quoteType: '"' | "'" | '`';
  content: string;
  lineNumber: number;
}

export interface TemplateStringInfo {
  withinBackticks: boolean;
  inTemplateString: boolean;
  positions?: {
    startBacktickPosition: vscode.Position;
    endBacktickPosition: vscode.Position;
  };
}

export interface DocumentCopy {
  lines: vscode.TextLine[];
  lineCount: number;
}

export interface ConversionResult {
  success: boolean;
  edit?: vscode.WorkspaceEdit;
  error?: string;
  newSelections?: vscode.Selection[];
}

export interface QuoteDetectionResult {
  found: boolean;
  startIndex: number;
  endIndex: number;
  quoteChar: QuoteChar;
  content: string;
}

export interface TemplateLiteralMatch {
  start: vscode.Position;
  end: vscode.Position;
  content: string;
  hasTemplateSyntax: boolean;
  isValidContext: boolean;
}
