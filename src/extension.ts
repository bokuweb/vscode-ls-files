'use strict';

import { exec } from 'child_process';
import { quote } from 'shell-quote';
import { window, commands, ExtensionContext, workspace, QuickPickItem } from 'vscode';

const projectRoot = workspace.rootPath ? workspace.rootPath : '.';

const pexec = (command: string, option: {}): Promise<string> => new Promise((resolve, reject) => {
    exec(command, option, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(stdout);
    });
});

export function activate(context: ExtensionContext) {
    const disposable = commands.registerCommand('lsFiles.open', async () => {
        const command = quote(['git', 'ls-files']);
        let out: string;
        try {
            out = await pexec(command, { cwd: projectRoot, maxBuffer: 2000 * 1024 });
        } catch (e) {
            return window.showErrorMessage(e);
        }
        const lines = out.split(/\n/);
        if (!lines.length) return window.showInformationMessage('There are no items.');
        const items = lines.map(path => ({ label: `${path}`, description: '' }));
        const item = await window.showQuickPick(items);
        if (!item) return;
        const doc = await workspace.openTextDocument(projectRoot + '/' + item.label);
        await window.showTextDocument(doc);
        context.subscriptions.push(disposable);
    });
}

export function deactivate() {
}
