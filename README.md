# Codex Terminal

一键打开 Codex 终端的 VS Code 扩展。

## 功能

- **快捷键触发**：`Cmd+Shift+C`（Mac）/ `Ctrl+Shift+C`（Windows/Linux）
- **自动打开终端**
- **自动输入 `codex` 命令**
- **终端在编辑器右侧显示**

## 本地调试

### 步骤 1：安装依赖

```bash
cd ~/Documents/05_AI/codex-terminal
npm install
```

### 步骤 2：用 VS Code 打开项目

```bash
code ~/Documents/05_AI/codex-terminal
```

### 步骤 3：启动调试

1. 按 `F5`（或菜单：Run → Start Debugging）
2. 会打开一个新的 VS Code 窗口（扩展开发主机）
3. 在新窗口中按 `Cmd+Shift+C` 测试扩展

### 调试技巧

- **查看日志**：在原窗口的 Debug Console 中查看 `console.log` 输出
- **热重载**：修改代码后，在调试窗口按 `Cmd+Shift+F5` 重新加载
- **断点调试**：在 `src/extension.ts` 中设置断点

## 安装到本地 VS Code

### 方式一：打包安装

```bash
# 安装打包工具（首次需要）
npm install -g @vscode/vsce

# 打包
cd ~/Documents/05_AI/codex-terminal
vsce package

# 安装
code --install-extension codex-terminal-0.0.1.vsix
```

### 方式二：开发模式链接

```bash
# 创建符号链接到扩展目录
ln -s ~/Documents/05_AI/codex-terminal ~/.vscode/extensions/codex-terminal

# 重启 VS Code
```

## 发布到插件商城

### 步骤 1：创建 Azure DevOps 账号

1. 访问 https://dev.azure.com
2. 用 Microsoft 账号登录
3. 创建一个组织（Organization）

### 步骤 2：创建 Personal Access Token (PAT)

1. 点击右上角头像 → Personal access tokens
2. 点击 "New Token"
3. 设置：
   - Name: `vsce`
   - Organization: 选择 "All accessible organizations"
   - Expiration: 自定义（建议 1 年）
   - Scopes: 选择 "Custom defined"，勾选 **Marketplace → Manage**
4. 点击 Create，**复制并保存 Token**（只显示一次）

### 步骤 3：创建 Publisher

```bash
# 登录（会提示输入 PAT）
vsce login <你的publisher名字>

# 或者创建新 Publisher
vsce create-publisher <你的publisher名字>
```

也可以在网页创建：https://marketplace.visualstudio.com/manage

### 步骤 4：完善 package.json

发布前需要添加以下字段：

```json
{
  "publisher": "你的publisher名字",
  "repository": {
    "type": "git",
    "url": "https://github.com/你的用户名/codex-terminal"
  },
  "icon": "images/icon.png",
  "license": "MIT"
}
```

### 步骤 5：添加 CHANGELOG 和 LICENSE

```bash
touch CHANGELOG.md LICENSE
```

### 步骤 6：发布

```bash
# 打包并发布
vsce publish

# 或者指定版本
vsce publish 0.0.1
```

### 发布后

- 审核通常需要几分钟
- 发布成功后可在 https://marketplace.visualstudio.com 搜索到

## 使用

1. 按 `Cmd+Shift+C`（Mac）或 `Ctrl+Shift+C`（Windows/Linux）
2. 或者打开命令面板（`Cmd+Shift+P`），输入 "Open Codex Terminal"

## 配置

如果想修改快捷键，在 `keybindings.json` 中添加：

```json
{
  "key": "你想要的快捷键",
  "command": "codex-terminal.open"
}
```

## 自定义命令

如果你想运行其他命令而不是 `codex`，可以修改 `src/extension.ts` 中的：

```typescript
codexTerminal.sendText('codex');
```

改成你想要的命令。
