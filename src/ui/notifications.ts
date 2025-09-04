/*
  notifications.ts
  Non-intrusive info/warn notifications for new tool detection and other events.
*/
import * as vscode from 'vscode';

export function notifyInfo(message: string) {
  vscode.window.showInformationMessage(message);
}

export function notifyWarn(message: string) {
  vscode.window.showWarningMessage(message);
}
