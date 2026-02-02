# 👋 贡献指南 (Contributing Guide)

首先，感谢你有兴趣为 **Perfect Pic Web** 做出贡献！我们需要像你这样的贡献者来让这个项目变得更好。✨

这份指南旨在帮助你更顺畅地参与到项目中来。

## 🤝 行为准则 (Code of Conduct)

我们希望不论你的背景和身份如何，都能在这个项目中感到受欢迎。请保持友善、尊重和宽容。❤️

## 🚀 如何参与？

### 1. 🐛 报告 Bug (Reporting Bugs)

如果你发现了 Bug，请通过 [GitHub Issues](https://github.com/your-username/perfect-pic-web/issues) 提交报告。

即使你不知道如何修复它，提交 Issue 也是非常有帮助的。在提交之前：

* **🔍 搜索现有的 Issue**：看看是否已经有人报告过类似的问题。
* **📝 使用 Bug 报告模板**：这有助于我们快速定位问题。请提供重现步骤、预期行为和实际行为。

### 2. 💡 建议新功能 (Suggesting Enhancements)

如果你有好的点子，欢迎提交 Issue 进行讨论。请详细描述你的建议以及它能解决的问题。

### 3. 💻 提交代码 (Pull Requests)

如果你想修复 Bug 或添加新功能，请遵循以下流程：

1. **Fork 本仓库** 🍴 到你的 GitHub 账户。
2. **克隆仓库** 📥 到本地：

    ```bash
    git clone https://github.com/your-username/perfect-pic-web.git
    cd perfect-pic-web
    ```

3. **安装依赖** 📦 (本项目使用 pnpm)：

    ```bash
    pnpm install
    ```

4. **创建一个新分支** 🌿。分支名称应具有描述性，例如 `feature/add-login-page` 或 `fix/header-layout`：

    ```bash
    git checkout -b feat/your-feature-name
    ```

5. **进行开发** 🔨。请确保你的代码符合项目的代码风格。
6. **本地运行测试** 🧪 (如果有)：

    ```bash
    # 确保项目能正常启动
    pnpm dev
    ```

7. **提交更改** 💾。推荐使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范编写提交信息：

    ```bash
    git commit -m "feat: 添加登录页面组件"
    ```

8. **推送到你的 Fork** 📤：

    ```bash
    git push origin feat/your-feature-name
    ```

9. **提交 Pull Request (PR)** 🔀。请填写 PR 模板，描述你的更改内容。

## 🛠️ 开发环境指南

### 前置要求

* 🟢 Node.js (建议 LTS 版本)
* 🦁 pnpm

### 项目设置

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 🎨 代码规范

* **TypeScript**: 请尽量避免使用 `any` 类型。🛡️
* **ESLint & Prettier**: 项目配置了 ESLint 和 Prettier，请确保你的代码在提交前通过检查，或者配置编辑器在保存时自动格式化。🧹
* **组件命名**: 请参照现有项目结构。📁

## ❓ 问题寻求

如果你在贡献过程中遇到任何问题，可以在 Issue 中提问，或者联系维护者。

再次感谢你的贡献！🎉
