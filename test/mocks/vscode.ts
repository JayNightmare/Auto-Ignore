// Mock setup for VS Code API
const uri: {
    parse: (uri: string) => { toString: () => uri };
  },
  ode = {
    workspace: {
      findFiles: () => Promise.resolve([]),
      fs: {
        readFile: () => Promise.resolve(Buffer.from('{"name":"test"}')),
      },
      getConfiguration: () => ({
        get: () => true,
      }),
      workspaceFolders: [],
    },
    window: {
      showInformationMessage: () => Promise.resolve(),
      showWarningMessage: () => Promise.resolve(),
      showErrorMessage: () => Promise.resolve(),
      createQuickPick: () => ({
        title: '',
        placeholder: '',
        items: [],
        selectedItems: [],
        canSelectMany: false,
        onDidAccept: () => {},
        onDidHide: () => {},
        show: () => {},
        dispose: () => {},
      }),
      createTerminal: () => ({
        show: () => {},
        sendText: () => {},
      }),
    },
    commands: {
      executeCommand: () => Promise.resolve(),
      registerCommand: () => ({ dispose: () => {} }),
    },
    Uri: {
      parse: (uri: string) => ({ toString: () => uri }),
    },
    env: {
      clipboard: {
        writeText: () => Promise.resolve(),
      },
    },
  };

// Set up the global mock
(global as any).vscode = vscode;

// Export for use in tests
export { vscode };
