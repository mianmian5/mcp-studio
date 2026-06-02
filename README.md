# 🧩 MCP Studio

<p>
  <strong>浏览、安装、配置 MCP 服务器，一键生成任意 AI 客户端的配置</strong>
  ·
  <em>Browse, install, and configure MCP servers for any AI client. One-click config generation.</em>
</p>

> 再也不用手动编辑 JSON 配置文件了。
> No more manually editing JSON config files.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()

---

## ✨ 功能 / Features

<details open>
<summary><strong>🇨🇳 中文</strong></summary>

| 功能 | 说明 |
|------|------|
| **🔍 浏览** | 搜索和筛选 **1,722** 个 MCP 服务器，按分类、语言、星标排序 |
| **⚡ 一键安装** | 点击任意服务器 → 配置环境变量 → 生成即用配置 |
| **🤖 多客户端** | 支持 **Claude Desktop、Cursor、Windsurf、OpenClaw、Cline** |
| **🔑 环境变量** | GUI 界面配置环境变量，无需手动编辑 |
| **📋 复制 & 下载** | 一键复制配置，或下载为 JSON 文件 |
| **🌙 深色模式** | 明暗主题自由切换 |
</details>

<details>
<summary><strong>🇬🇧 English</strong></summary>

| Feature | Description |
|---------|-------------|
| **🔍 Browse** | Search and filter **1,722** MCP servers by category, language, stars |
| **⚡ One-click Install** | Click any server → configure env vars → get ready-to-use config |
| **🤖 Multi-client** | Supports **Claude Desktop, Cursor, Windsurf, OpenClaw, Cline** |
| **🔑 Env Vars** | GUI for setting environment variables, no manual editing |
| **📋 Copy & Download** | Copy config to clipboard or download as JSON file |
| **🌙 Dark Mode** | Toggle between light and dark themes |
</details>

---

## 🎬 演示 / Demo

![MCP Studio](screenshot.jpg)

*搜索服务器，点击安装，配置环境变量，复制配置。搞定。*
*Search servers, click Install, configure env vars, copy config. Done.*

---

## 🏃 快速开始 / Quick Start

<details open>
<summary><strong>🇨🇳 中文</strong></summary>

```bash
git clone https://github.com/mianmian5/mcp-studio.git
cd mcp-studio
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)
</details>

<details>
<summary><strong>🇬🇧 English</strong></summary>

```bash
git clone https://github.com/mianmian5/mcp-studio.git
cd mcp-studio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
</details>

---

## 💡 为什么需要 MCP Studio？/ Why MCP Studio?

<details open>
<summary><strong>🇨🇳 中文</strong></summary>

MCP（Model Context Protocol）正在成为 AI Agent 调用工具的标准。但配置 MCP 服务器一直很痛苦：

- ❌ 手动编辑 JSON 配置文件
- ❌ 不同 AI 客户端的配置格式不一样
- ❌ 容易忘记设置环境变量
- ❌ 不知道有哪些服务器可用

**MCP Studio 一次性解决所有问题。** 一个界面浏览、安装、配置所有 MCP 服务器。
</details>

<details>
<summary><strong>🇬🇧 English</strong></summary>

MCP (Model Context Protocol) is becoming the standard for AI agents to interact with tools. But setting up MCP servers is a pain:

- ❌ Manually editing JSON config files
- ❌ Different formats for different AI clients
- ❌ Forgetting to set environment variables
- ❌ Hard to discover what's available

**MCP Studio fixes all of that.** One UI to browse, install, and configure everything.
</details>

---

## 🛠️ 技术栈 / Tech Stack

| 组件 / Component | 技术 / Technology |
|-----------------|-----------------|
| 框架 / Framework | Next.js 16 + TypeScript |
| 样式 / Styling | Tailwind CSS v4 |
| 数据 / Data | 1,722 MCP servers (from GitHub) |

---

## 📜 License

MIT
