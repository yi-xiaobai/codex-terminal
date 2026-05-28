import * as vscode from 'vscode';

let codexTerminal: vscode.Terminal | undefined;
let lastOpenTime = 0;
let terminalCount = 0;

class CodexViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'codexTerminalView';

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = getWebviewHtml();

        webviewView.webview.onDidReceiveMessage((message) => {
            if (message?.command === 'openCodex') {
                openCodexTerminal();
            }
        });

        // 当侧边栏视图变为可见时自动打开终端
        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                openCodexTerminal();
            }
        });

        // 首次创建视图时立即打开终端
        openCodexTerminal();
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Codex Terminal extension is now active');

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(CodexViewProvider.viewType, new CodexViewProvider())
    );

    const disposable = vscode.commands.registerCommand('codex-terminal.open', openCodexTerminal);

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

function getWebviewHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            padding: 12px;
        }
        button {
            width: 100%;
            padding: 8px 12px;
            color: var(--vscode-button-foreground);
            background: var(--vscode-button-background);
            border: none;
            border-radius: 2px;
            cursor: pointer;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
    </style>
</head>
<body>
    <button id="open">Open Codex Terminal</button>
    <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('open').addEventListener('click', () => {
            vscode.postMessage({ command: 'openCodex' });
        });
    </script>
</body>
</html>`;
}

async function openCodexTerminal() {
    const now = Date.now();
    if (now - lastOpenTime < 500) {
        return;
    }
    lastOpenTime = now;

    // 每次都创建新终端
    terminalCount++;
    codexTerminal = vscode.window.createTerminal({
        name: `Codex ${terminalCount}`
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
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function deactivate() {
    codexTerminal = undefined;
}
