'use strict';

import { exec } from 'child_process';
import { quote } from 'shell-quote';
import { window, commands, ExtensionContext, workspace, Selection, QuickPickItem, QuickPickOptions } from 'vscode';

interface QuickPickItemWithPath extends QuickPickItem {
    fullPath?: string;
}

const projectRoot = workspace.rootPath ? workspace.rootPath : '.';

console.log(projectRoot)
export function activate(context: ExtensionContext) {

    (async () => {
        const disposable = commands.registerCommand('extension.lsFiles', async () => {
            const command = quote(['git', 'ls-files']);

            const fetchItems = (): Promise<QuickPickItemWithPath[]> => new Promise((resolve, reject) => {
                exec(command, { cwd: projectRoot }, (err, stdout, stderr) => {
                    if (stderr) {
                        window.showErrorMessage(stderr);
                        return resolve([]);
                    }
                    const lines = stdout.split(/\n/).filter(l => l !== '');
                    if (!lines.length) {
                        window.showInformationMessage('There are no items.')
                        return resolve([]);
                    }
                    return resolve(lines.map(path => {
                        return {
                            label: `${path}`,
                            description: '',
                        };
                    }));

                });
            });

            const options: QuickPickOptions = { };
            const item = await window.showQuickPick(fetchItems(), options);
            if (!item) return;
            const doc = await workspace.openTextDocument(projectRoot + '/' + item.label);
            await window.showTextDocument(doc);
            context.subscriptions.push(disposable);
        });
    })().catch((error) => {
        window.showErrorMessage(error);
    });
}

export function deactivate() {
}
