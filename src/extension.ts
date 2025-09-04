/*
  Auto .gitignore VS Code Extension
  Entry point: registers commands, manages activation, and orchestrates stack detection, diff preview, updates, and secret scanning.
*/
import * as vscode from 'vscode';
import { detectStack } from './api/detector';
import { buildGitignore, mergeGitignore, writeGitignore } from './api/merger';
import { showDiff } from './api/diff';
import { scanForSecrets } from './api/secrets';
import { getWorkspaceTargets } from './api/workspace';
import { showQuickPick } from './ui/quickPick';
import { notifyInfo, notifyWarn } from './ui/notifications';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('autoGitignore.generate', async () => {
      try {
        const targets = await getWorkspaceTargets();
        if (targets.length === 0) {
          vscode.window.showWarningMessage('No workspace folder found');
          return;
        }

        notifyInfo('Detecting project stack...');
        const stackResult = await detectStack(targets);

        const selectedSections = await showQuickPick(stackResult.sections);
        if (selectedSections.length === 0) {
          return;
        }

        const proposed = buildGitignore(selectedSections);
        const existing = await mergeGitignore(targets, proposed);

        const shouldApply = await showDiff(existing, proposed);
        if (shouldApply) {
          await writeGitignore(targets[0], proposed);
          notifyInfo('Successfully updated .gitignore');
        }
      } catch (error) {
        console.error('Error generating .gitignore:', error);
        vscode.window.showErrorMessage('Failed to generate .gitignore');
      }
    }),

    vscode.commands.registerCommand('autoGitignore.updateForNewTools', async () => {
      try {
        const targets = await getWorkspaceTargets();
        if (targets.length === 0) {
          vscode.window.showWarningMessage('No workspace folder found');
          return;
        }

        // Re-scan for new tools/configs and suggest additions
        const stackResult = await detectStack(targets);
        const proposed = buildGitignore(stackResult.sections);
        const existing = await mergeGitignore(targets, proposed);

        if (existing === proposed) {
          notifyInfo('No new tools detected - .gitignore is up to date');
          return;
        }

        const shouldApply = await showDiff(existing, proposed);
        if (shouldApply) {
          await writeGitignore(targets[0], proposed);
          notifyInfo('Successfully updated .gitignore with new tools');
        }
      } catch (error) {
        console.error('Error updating .gitignore:', error);
        vscode.window.showErrorMessage('Failed to update .gitignore');
      }
    }),

    vscode.commands.registerCommand('autoGitignore.scanForSecrets', async () => {
      await scanForSecrets();
    })
  );

  // Watch for new tools/configs if enabled
  const config = vscode.workspace.getConfiguration('autoGitignore');
  if (config.get('watchNewTools')) {
    const watcher = vscode.workspace.createFileSystemWatcher(
      '{**/package.json,**/pyproject.toml,**/build.gradle*,**/Dockerfile}'
    );

    watcher.onDidCreate(async (uri) => {
      const choice = await vscode.window.showInformationMessage(
        'New project files detected. Update .gitignore?',
        'Update',
        'Later'
      );

      if (choice === 'Update') {
        vscode.commands.executeCommand('autoGitignore.updateForNewTools');
      }
    });

    context.subscriptions.push(watcher);
  }

  // Prompt if no .gitignore exists on first run
  setTimeout(async () => {
    const targets = await getWorkspaceTargets();
    if (targets.length > 0) {
      const fs = require('fs');
      const path = require('path');
      const gitignorePath = path.join(targets[0], '.gitignore');

      if (!fs.existsSync(gitignorePath)) {
        const choice = await vscode.window.showInformationMessage(
          'No .gitignore found in workspace. Generate one?',
          'Generate',
          'Later'
        );

        if (choice === 'Generate') {
          vscode.commands.executeCommand('autoGitignore.generate');
        }
      }
    }
  }, 2000);
}

export function deactivate() {}
