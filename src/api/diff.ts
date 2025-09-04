/*
  diff.ts
  Shows a diff preview between existing and proposed .gitignore using VS Code diff UI.
*/
import * as vscode from 'vscode';

export async function showDiff(existing: string, proposed: string): Promise<boolean> {
  try {
    // Create temporary URIs for diff
    const existingUri = vscode.Uri.parse(`untitled:Current .gitignore`);
    const proposedUri = vscode.Uri.parse(`untitled:Proposed .gitignore`);

    // Register content providers
    const existingProvider = new (class implements vscode.TextDocumentContentProvider {
      provideTextDocumentContent(): string {
        return existing || '# No existing .gitignore';
      }
    })();

    const proposedProvider = new (class implements vscode.TextDocumentContentProvider {
      provideTextDocumentContent(): string {
        return proposed;
      }
    })();

    const existingRegistration = vscode.workspace.registerTextDocumentContentProvider(
      'untitled',
      existingProvider
    );
    const proposedRegistration = vscode.workspace.registerTextDocumentContentProvider(
      'untitled',
      proposedProvider
    );

    // Show diff
    await vscode.commands.executeCommand(
      'vscode.diff',
      existingUri,
      proposedUri,
      'Auto .gitignore: Review Changes'
    );

    // Ask user if they want to apply
    const choice = await vscode.window.showInformationMessage(
      'Apply the proposed .gitignore changes?',
      { modal: true },
      'Apply',
      'Cancel'
    );

    // Cleanup
    existingRegistration.dispose();
    proposedRegistration.dispose();

    return choice === 'Apply';
  } catch (error) {
    console.error('Error showing diff:', error);
    vscode.window.showErrorMessage('Failed to show diff preview');
    return false;
  }
}
