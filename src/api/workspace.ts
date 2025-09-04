/*
  workspace.ts
  Monorepo helpers: enumerate workspaceFolders, detect package roots, decide .gitignore targets.
*/
import * as vscode from 'vscode';
import * as path from 'path';

export async function getWorkspaceTargets(): Promise<string[]> {
  const config = vscode.workspace.getConfiguration('autoGitignore');
  const monorepoMode = config.get<string>('monorepoMode', 'auto');

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return [];
  }

  const rootPath = workspaceFolders[0].uri.fsPath;

  if (monorepoMode === 'root-only') {
    return [rootPath];
  }

  if (monorepoMode === 'package-level') {
    return await getPackageRoots(rootPath);
  }

  // Auto mode: detect if it's a monorepo
  const packageRoots = await getPackageRoots(rootPath);
  if (packageRoots.length > 1) {
    // It's a monorepo, but prefer root-level .gitignore
    return [rootPath];
  }

  return [rootPath];
}

async function getPackageRoots(rootPath: string): Promise<string[]> {
  try {
    // Look for package.json files in common monorepo structures
    const packageFiles = await vscode.workspace.findFiles(
      '{packages/*/package.json,apps/*/package.json,libs/*/package.json}',
      '**/node_modules/**'
    );

    const packageRoots = packageFiles.map((file) => path.dirname(file.fsPath));

    // Always include root if it has package.json
    const rootPackageFile = await vscode.workspace.findFiles('package.json', '**/node_modules/**');

    if (rootPackageFile.length > 0) {
      packageRoots.unshift(rootPath);
    }

    return [...new Set(packageRoots)]; // Remove duplicates
  } catch (error) {
    console.error('Error detecting package roots:', error);
    return [rootPath];
  }
}

export function getGitignorePath(targetPath: string): string {
  return path.join(targetPath, '.gitignore');
}
