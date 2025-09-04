/*
  secrets.ts
  Finds tracked secrets and offers to ignore/untrack them.
*/
import * as vscode from 'vscode';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const SENSITIVE_PATTERNS = [
  /\.env$/,
  /\.env\./,
  /\.pem$/,
  /\.key$/,
  /\.p12$/,
  /\.keystore$/,
  /\.jks$/,
  /secret/i,
  /password/i,
  /credential/i,
  /token/i,
];

export async function scanForSecrets(): Promise<void> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showWarningMessage('No workspace folder found');
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const trackedFiles = await getTrackedFiles(rootPath);
    const suspiciousFiles = trackedFiles.filter((file) =>
      SENSITIVE_PATTERNS.some((pattern) => pattern.test(file))
    );

    if (suspiciousFiles.length === 0) {
      vscode.window.showInformationMessage('No suspicious tracked files found.');
      return;
    }

    // Show suspicious files to user
    const items = suspiciousFiles.map((file) => ({
      label: file,
      description: 'Potentially sensitive file',
      file,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      canPickMany: true,
      placeHolder: 'Select files to ignore and untrack',
    });

    if (selected && selected.length > 0) {
      await handleSecretFiles(
        rootPath,
        selected.map((item) => item.file)
      );
    }
  } catch (error) {
    console.error('Error scanning for secrets:', error);
    vscode.window.showErrorMessage('Error scanning for secrets');
  }
}

async function getTrackedFiles(rootPath: string): Promise<string[]> {
  try {
    // Try to get tracked files from git
    const { stdout } = await execFileAsync('git', ['ls-files', '-z'], {
      cwd: rootPath,
      timeout: 5000,
    });

    return stdout.split('\0').filter((file) => file.length > 0);
  } catch (error) {
    // If git fails, fallback to filesystem scan
    console.warn('Git not available, falling back to filesystem scan');
    return await getFilesystemFiles(rootPath);
  }
}

async function getFilesystemFiles(rootPath: string): Promise<string[]> {
  try {
    const files = await vscode.workspace.findFiles(
      '**/*',
      '{**/node_modules/**,**/.git/**,**/dist/**,**/build/**}'
    );

    return files.map((file) => path.relative(rootPath, file.fsPath).replace(/\\/g, '/'));
  } catch (error) {
    console.error('Error scanning filesystem:', error);
    return [];
  }
}

async function handleSecretFiles(rootPath: string, files: string[]): Promise<void> {
  const gitignorePath = path.join(rootPath, '.gitignore');

  // Add to .gitignore
  const patterns = files.join('\n') + '\n';

  try {
    const fs = require('fs');
    let existing = '';
    if (fs.existsSync(gitignorePath)) {
      existing = fs.readFileSync(gitignorePath, 'utf8');
    }

    const updated = existing + '\n# Added by Auto .gitignore - secrets\n' + patterns;
    fs.writeFileSync(gitignorePath, updated);

    // Show untrack command
    const untrackCommand = `git rm --cached ${files.map((f) => `"${f}"`).join(' ')} && git commit -m "Remove secrets from repo"`;

    const choice = await vscode.window.showInformationMessage(
      `Added ${files.length} files to .gitignore. To remove them from git history, run:`,
      'Copy Command',
      'Open Terminal'
    );

    if (choice === 'Copy Command') {
      await vscode.env.clipboard.writeText(untrackCommand);
      vscode.window.showInformationMessage('Command copied to clipboard');
    } else if (choice === 'Open Terminal') {
      const terminal = vscode.window.createTerminal();
      terminal.show();
      terminal.sendText(untrackCommand);
    }
  } catch (error) {
    console.error('Error handling secret files:', error);
    vscode.window.showErrorMessage('Error updating .gitignore');
  }
}
