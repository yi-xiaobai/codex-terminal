import * as vscode from 'vscode';

let codexTerminal: vscode.Terminal | undefined;

class CodexViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codexTerminalView';

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        vscode.commands.executeCommand('codex-terminal.open');
        webviewView.webview.html = '<html><body></body></html>';
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Codex Terminal extension is now active');

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(CodexViewProvider.viewType, new CodexViewProvider())
    );

    const disposable = vscode.commands.registerCommand('codex-terminal.open', async () => {
        // 如果已有 codex 终端且还活着，直接显示它
        if (codexTerminal && isTerminalAlive(codexTerminal)) {
            codexTerminal.show();
            return;
        }

        // 创建终端
        codexTerminal = vscode.window.createTerminal({
            name: 'Codex'
        });

        // 显示终端
        codexTerminal.show();

        // 将底部终端移动到编辑器区域
        await vscode.commands.executeCommand('workbench.action.terminal.moveToEditor');

        // 将终端编辑器移动到右侧分屏
        await vscode.commands.executeCommand('workbench.action.moveEditorToRightGroup');

        // 稍等一下让终端准备好
        await sleep(300);

        // 发送 codex 命令
        codexTerminal.sendText('codex');
    });

    // 监听终端关闭事件
    const terminalCloseListener = vscode.window.onDidCloseTerminal((terminal: vscode.Terminal) => {
        if (terminal === codexTerminal) {
            codexTerminal = undefined;
        }
    });

    context.subscriptions.push(disposable, terminalCloseListener);
}

function isTerminalAlive(terminal: vscode.Terminal): boolean {
    return vscode.window.terminals.includes(terminal);
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function deactivate() {
    codexTerminal = undefined;
}
