/*
  quickPick.ts
  QuickPick UI for toggling sections before applying .gitignore changes.
*/
import * as vscode from 'vscode';

interface SectionItem extends vscode.QuickPickItem {
  section: string;
  enabled: boolean;
}

export async function showQuickPick(sections: string[]): Promise<string[]> {
  const items: SectionItem[] = sections.map((section) => ({
    label: `$(check) ${section}`,
    description: getSectionDescription(section),
    section,
    enabled: true,
    picked: true,
  }));

  const quickPick = vscode.window.createQuickPick<SectionItem>();
  quickPick.title = 'Auto .gitignore: Select sections to include';
  quickPick.placeholder = 'Toggle sections on/off, then press Enter to continue';
  quickPick.items = items;
  quickPick.selectedItems = items;
  quickPick.canSelectMany = true;

  return new Promise((resolve) => {
    quickPick.onDidAccept(() => {
      const selectedSections = quickPick.selectedItems.map((item) => item.section);
      quickPick.dispose();
      resolve(selectedSections);
    });

    quickPick.onDidHide(() => {
      quickPick.dispose();
      resolve(sections); // Return all sections if dismissed
    });

    quickPick.show();
  });
}

function getSectionDescription(section: string): string {
  const descriptions: Record<string, string> = {
    os: 'OS-specific files (.DS_Store, Thumbs.db)',
    editor: 'Editor files (.idea/, .vscode/)',
    node: 'Node.js files (node_modules/, dist/, build/)',
    reactNative: 'React Native files (ios/Pods/, android/.gradle/)',
    python: 'Python files (.venv/, __pycache__/, *.pyc)',
    javaKotlin: 'Java/Kotlin files (build/, out/, .idea/)',
    mobile: 'Mobile development (android/, ios/, Pods/)',
    testing: 'Test output (coverage/, test-results/)',
    logs: 'Log files (*.log, *.pid)',
    secrets: 'Sensitive files (.env, *.pem, *.key)',
    docker: 'Docker files',
  };

  return descriptions[section] || 'Custom section';
}
