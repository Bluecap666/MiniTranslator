# 🚀 发布到 GitHub - 快速指南

## ✅ 准备工作已完成

### 已创建的文件

1. **✨ README.md** - 完善的项目文档（包含截图）
2. **📝 RELEASE_NOTES.md** - Release 发布说明
3. **📋 GITHUB_RELEASE_GUIDE.md** - 详细发布指南
4. **🤖 publish-to-github.ps1** - 自动化发布脚本
5. **📄 .gitignore** - Git 忽略文件配置

### 打包文件

```
dist/
└── 迷你翻译小工具 -1.0.0-Portable.exe  (65.97 MB)
```

---

## 🎯 快速发布流程

### 方式一：使用自动化脚本（推荐）⭐⭐⭐⭐⭐

#### 执行命令

```powershell
# 在项目根目录运行
.\publish-to-github.ps1
```

#### 脚本会自动完成：

1. ✅ 检查打包文件
2. ✅ 初始化 Git 仓库
3. ✅ 配置用户信息
4. ✅ 添加远程仓库
5. ✅ 提交所有文件
6. ✅ 推送到 GitHub
7. ✅ 创建版本标签
8. ✅ 指导创建 Release

#### 交互提示

脚本会询问：
- Git 用户名和邮箱（如果未配置）
- 提交信息（可使用默认）
- Release 创建方式（CLI 或网页）

---

### 方式二：手动执行命令

#### 步骤 1: 初始化 Git

```powershell
# 初始化仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "🚀 Release v1.0.0 - 迷你翻译小工具正式发布"
```

#### 步骤 2: 关联远程仓库

```powershell
# 添加远程仓库
git remote add origin https://github.com/Bluecap666/MiniTranslator.git

# 查看远程仓库
git remote -v
```

#### 步骤 3: 推送代码

```powershell
# 重命名分支
git branch -M main

# 推送到 GitHub
git push -u origin main
```

#### 步骤 4: 创建标签

```powershell
# 创建版本标签
git tag -a v1.0.0 -m "🚀 Release v1.0.0 - 迷你翻译小工具正式发布"

# 推送标签
git push origin v1.0.0
```

#### 步骤 5: 创建 Release

访问：https://github.com/Bluecap666/MiniTranslator/releases/new

填写信息：
```
Tag version: v1.0.0
Release title: 🚀 v1.0.0 - 迷你翻译小工具正式发布
```

复制 [RELEASE_NOTES.md](./RELEASE_NOTES.md) 的内容到描述框。

上传附件：
- `dist/迷你翻译小工具 -1.0.0-Portable.exe`
- `dist/使用说明.txt`

勾选 "Set as the latest release"，点击 "Publish release"。

---

## 📊 Emoji 提交规范

### 推荐的提交格式

| Emoji | 用途 | 示例 |
|-------|------|------|
| ✨ | 新功能 | `✨ 新增多平台翻译功能` |
| 🐛 | Bug 修复 | `🐛 修复 API 测试失败` |
| 📝 | 文档更新 | `📝 完善 README 文档` |
| 🎨 | 界面美化 | `🎨 优化 UI 布局` |
| ⚡ | 性能优化 | `⚡ 添加超时控制` |
| 📦 | 打包发布 | `📦 发布 v1.0.0` |
| 🔧 | 配置修改 | `🔧 修改配置文件路径` |
| 🚀 | 部署发布 | `🚀 首次发布` |

### 本次提交的 Emoji

```bash
# 初始提交
git commit -m "✨ Initial commit - 迷你翻译小工具 v1.0.0"

# 或者最终发布
git commit -m "🚀 Release v1.0.0 - 迷你翻译小工具正式发布"
```

---

## 📁 文件清单

### 核心代码文件

- ✅ `main.js` - Electron 主进程
- ✅ `preload.js` - 预加载脚本
- ✅ `index.html` - 主窗口 HTML
- ✅ `styles.css` - 主窗口样式
- ✅ `renderer.js` - 渲染进程逻辑
- ✅ `config-window.html` - 配置窗口 HTML
- ✅ `config.css` - 配置窗口样式
- ✅ `config.js` - 配置窗口逻辑
- ✅ `package.json` - 项目配置

### 文档文件

- ✅ `README.md` - 主文档（含截图）
- ✅ `使用说明.txt` - 快速上手
- ✅ `RELEASE_NOTES.md` - Release 说明
- ✅ `GITHUB_RELEASE_GUIDE.md` - 发布指南
- ✅ `CONFIG_PATH_EXPLANATION.md` - 配置路径说明
- ✅ `FIX_PACKAGING_API_TEST.md` - API 问题修复
- ✅ 其他 *.md 文档

### 打包文件

- ✅ `dist/迷你翻译小工具 -1.0.0-Portable.exe` (66MB)
- ✅ `dist/builder-effective-config.yaml`
- ✅ `dist/builder-debug.yml`

### 忽略的文件

- ❌ `node_modules/` - 依赖包
- ❌ `dist/win-unpacked/` - 未打包的目录
- ❌ `dist/*.blockmap` - 更新文件
- ❌ `config.json` - 用户配置（含密钥）
- ❌ `*.log` - 日志文件

---

## 🎯 完整的 Git 提交流程

### 分阶段提交（推荐）

```powershell
# 第 1 阶段：核心代码
git add main.js preload.js renderer.js index.html styles.css config-window.html config.css config.js package.json
git commit -m "✨ Add core translation functionality"

# 第 2 阶段：文档
git add README.md 使用说明.txt RELEASE_NOTES.md
git commit -m "📝 Add comprehensive documentation"

# 第 3 阶段：打包文件
git add dist/迷你翻译小工具 -1.0.0-Portable.exe
git commit -m "📦 Add packaged executable"

# 第 4 阶段：配置文件
git add .gitignore publish-to-github.ps1 *.md
git commit -m "🔧 Add configuration and scripts"

# 推送到 GitHub
git push -u origin main
```

### 一次性提交（简单）

```powershell
# 添加所有文件
git add .

# 一次提交
git commit -m "🚀 Release v1.0.0 - 迷你翻译小工具正式发布"

# 推送到 GitHub
git push -u origin main
```

---

## 🏷️ 创建 Release 的两种方式

### 方式 A: GitHub CLI（自动化）

#### 安装 GitHub CLI

```powershell
# 使用 winget
winget install --id GitHub.cli

# 或使用 chocolatey
choco install gh
```

#### 登录 GitHub

```powershell
gh auth login
```

#### 创建 Release

```powershell
gh release create v1.0.0 `
  --title "🚀 v1.0.0 - 迷你翻译小工具正式发布" `
  --notes-file RELEASE_NOTES.md `
  dist\迷你翻译小工具 -1.0.0-Portable.exe `
  dist\使用说明.txt
```

### 方式 B: GitHub 网页（手动）

#### 步骤

1. 访问 https://github.com/Bluecap666/MiniTranslator/releases/new

2. 填写信息：
   ```
   Tag version: v1.0.0
   Release title: 🚀 v1.0.0 - 迷你翻译小工具正式发布
   ```

3. 复制 RELEASE_NOTES.md 内容到描述框

4. 上传文件：
   - 拖拽 `dist/迷你翻译小工具 -1.0.0-Portable.exe`
   - 拖拽 `dist/使用说明.txt`

5. 勾选 "☑️ Set as the latest release"

6. 点击 "Publish release"

---

## 📸 README 中的截图

### 已包含的截图

1. **主页面.png** (64.2KB)
   - 展示主界面
   - 位置：README.md 中

2. **api 配置.png** (117.4KB)
   - 展示配置窗口
   - 位置：README.md 中

### 截图路径

在 README.md 中使用相对路径：
```markdown
![主页面](./主页面.png)
![API 配置](./api 配置.png)
```

GitHub 会自动显示这些图片。

---

## ✅ 检查清单

### 发布前检查

- [ ] ✅ 打包文件已生成 (`dist/*.exe`)
- [ ] ✅ README.md 已完善（包含截图）
- [ ] ✅ RELEASE_NOTES.md 已创建
- [ ] ✅ .gitignore 已配置
- [ ] ✅ 所有文件已添加到 Git
- [ ] ✅ 远程仓库已关联

### 发布后验证

- [ ] ✅ 代码已推送到 GitHub
- [ ] ✅ 标签 v1.0.0 已创建
- [ ] ✅ Release 已发布
- [ ] ✅ 附件已上传
- [ ] ✅ README 截图正常显示
- [ ] ✅ 项目主页可访问

---

## 🎉 发布完成后的链接

### 项目相关

- **项目主页**: https://github.com/Bluecap666/MiniTranslator
- **Releases**: https://github.com/Bluecap666/MiniTranslator/releases
- **v1.0.0 Release**: https://github.com/Bluecap666/MiniTranslator/releases/tag/v1.0.0

### 分享模板

```
🎉 迷你翻译小工具 v1.0.0 正式发布！

✨ 多平台并行翻译
⚡ 8 秒快速响应
📌 磁吸置顶设计
🎨 精美紫色主题

📥 下载：https://github.com/Bluecap666/MiniTranslator/releases/tag/v1.0.0

#Electron #翻译工具 #桌面应用 #开源软件
```

---

## 💡 常见问题

### Q: 推送失败怎么办？
**A**: 检查网络连接，确认 GitHub 账号已登录，或使用 HTTPS 而非 SSH。

### Q: 如何修改提交信息？
**A**: 使用 `git commit --amend` 修改最后一次提交。

### Q: 可以删除已推送的标签吗？
**A**: 可以，但建议谨慎操作：
```bash
# 本地删除
git tag -d v1.0.0

# 远程删除
git push origin :refs/tags/v1.0.0

# 重新创建并推送
git tag -a v1.0.0 -m "新标题"
git push origin v1.0.0
```

### Q: Release 创建后可以修改吗？
**A**: 可以，在 GitHub 上编辑 Release 即可。

---

## 📞 需要帮助？

如果遇到任何问题：

1. 查看详细指南：[GITHUB_RELEASE_GUIDE.md](./GITHUB_RELEASE_GUIDE.md)
2. 检查 Git 状态：`git status`
3. 查看 Git 日志：`git log --oneline`
4. 联系开发者或提交 Issue

---

**🎊 祝发布顺利！**

准备好后，运行：
```powershell
.\publish-to-github.ps1
```

或者手动执行上述命令即可！🚀
