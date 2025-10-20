import * as vscode from "vscode";
import { ExtensionConfiguration } from "./types";

export class ConfigurationManager {
  private static readonly CONFIG_SECTION = "quicktick";
  
  /**
   * Get the current configuration
   */
  static getConfiguration(): ExtensionConfiguration {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    
    return {
      enabled: config.get<boolean>("enableAutoConvert", true),
      quoteType: "both", // Default for QuickTick
      validLanguages: config.get<string[]>("supportedLanguages", [
        "javascript",
        "typescript", 
        "javascriptreact",
        "typescriptreact"
      ]),
      addBracketsToProps: false, // Default for QuickTick
      autoRemoveTemplateString: true, // Default for QuickTick
      convertOutermostQuotes: true, // Default for QuickTick
      convertWithinTemplateString: true, // Default for QuickTick
      filesExcluded: [] // Default for QuickTick
    };
  }
  
  /**
   * Check if the extension is enabled
   */
  static isEnabled(): boolean {
    return this.getConfiguration().enabled;
  }
  
  /**
   * Check if a language is supported
   */
  static isLanguageSupported(languageId: string): boolean {
    const config = this.getConfiguration();
    return config.validLanguages.includes(languageId);
  }
  
  /**
   * Check if a file should be excluded
   */
  static isFileExcluded(fileName: string): boolean {
    const config = this.getConfiguration();
    let exclusions = config.filesExcluded;
    
    if (!exclusions || exclusions.length === 0) {
      return false;
    }
    
    // Support for old object-based exclusions
    if (!Array.isArray(exclusions)) {
      const newExclusions: string[] = [];
      for (const [key, value] of Object.entries(exclusions)) {
        if (value) {
          newExclusions.push(key);
        }
      }
      exclusions = newExclusions;
    }
    
    return exclusions.some(match => fileName.match(match));
  }
  
  /**
   * Get quote character based on configuration
   */
  static getQuoteChar(): "both" | `'` | `"` | '`' {
    const config = this.getConfiguration();
    const quoteType = config.quoteType;
    
    if (!quoteType || quoteType === "both") {
      return "both";
    } else if (quoteType === "single") {
      return "'";
    } else {
      return '"';
    }
  }
  
  /**
   * Update a configuration value
   */
  static async updateConfiguration(
    key: string,
    value: any,
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
    await config.update(key, value, target);
  }
  
  /**
   * Listen for configuration changes
   */
  static onConfigurationChange(callback: (event: vscode.ConfigurationChangeEvent) => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(callback);
  }
}
