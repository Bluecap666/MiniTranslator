# 🚀 GitHub 发布完整流程指南

## 📋 准备工作

### 1. 确认打包文件已生成

```powershell
# 检查 dist 目录
Get-ChildItem dist\*.exe | Select-Object Name, @{Label="大小 (MB)";Expression={[math]::Round($_.Length/1MB,2)}}
```

**预期结果**:
```
Name                              大小 (MB)
----                              ---------
迷你翻译小工具 -1.0.0-Portable.exe    65.97
```

---

## 🔧 第一步：初始化 Git 仓库

### 1.1 初始化仓库

```powershell
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 第一次提交
git commit -m "✨ Initial commit - 迷你翻译小工具 v1.0.0"
```

### 1.2 关联远程仓库

```powershell
# 添加远程仓库（如果已经关联过，跳过此步）
git remote add origin https://github.com/Bluecap666/MiniTranslator.git

# 查看远程仓库
git remote -v
```

---

## 📝 第二步：完善文档并提交

### 2.1 推荐使用的 Emoji 提交规范

#### GitHub 支持的 Emoji 列表

| Emoji | 代码 | 用途 | 示例 |
|-------|------|------|------|
| ✨ | `:sparkles:` | 新功能 | `✨ 新增多平台翻译功能` |
| 🐛 | `:bug:` | Bug 修复 | `🐛 修复 API 测试失败问题` |
| 📝 | `:memo:` | 文档更新 | `📝 完善 README 文档` |
| 🎨 | `:art:` | 界面美化 | `🎨 优化 UI 布局` |
| ⚡ | `:zap:` | 性能优化 | `⚡ 添加 8 秒超时控制` |
| 📦 | `:package:` | 打包发布 | `📦 发布 v1.0.0 版本` |
| 🔧 | `:wrench:` | 配置修改 | `🔧 修改配置文件路径` |
| 💬 | `:speech_balloon:` | 注释更新 | `💬 添加详细注释` |
| 🚑 | `:ambulance:` | 紧急修复 | `🚑 修复严重错误` |
| 💄 | `:lipstick:` | 样式美化 | `💄 添加艺术字标题` |
| 🗑️ | `:put_litter_in_its_place:` | 删除文件 | `🗑️ 删除无用代码` |
| ✅ | `:white_check_mark:` | 测试相关 | `✅ 添加单元测试` |
| 🔒️ | `:lock:` | 安全相关 | `🔒 增强数据加密` |
| 🚀 | `:rocket:` | 部署发布 | `🚀 首次发布` |

### 2.2 本次提交的完整命令

```powershell
# 分阶段提交（推荐）

# 1. 提交核心代码
git add main.js preload.js renderer.js index.html styles.css config-window.html config.css config.js package.json
git commit -m "✨ Add core translation functionality"

# 2. 提交文档
git add README.md *.md 使用说明.txt
git commit -m "📝 Add comprehensive documentation"

# 3. 提交打包配置
git add dist/*.exe dist/*.yaml dist/*.yml 2>$null
git commit -m "📦 Add packaged executable files"

# 4. 一次性提交（简单方式）
git add .
git commit -m "🚀 Release v1.0.0 - 迷你翻译小工具正式发布"
```

---

## 🌿 第三步：推送到 GitHub

### 3.1 推送到主分支

```powershell
# 重命名分支为 main
git branch -M main

# 推送到 GitHub
git push -u origin main
```

### 3.2 创建发布标签

```powershell
# 创建版本标签
git tag -a v1.0.0 -m "🚀 Release v1.0.0 - 迷你翻译小工具正式发布"

# 推送标签到 GitHub
git push origin v1.0.0
```

---

## 📦 第四步：创建 GitHub Release

### 方式 A: 使用 GitHub CLI（推荐）⭐

#### 安装 GitHub CLI

```powershell
# 使用 winget 安装
winget install --id GitHub.cli

# 或使用 chocolatey 安装
choco install gh
```

#### 登录 GitHub

```powershell
# 登录 GitHub
gh auth login

# 按提示操作：
# 1. 选择 GitHub.com
# 2. 选择 HTTPS
# 3. 复制设备码并在浏览器打开
# 4. 授权 CLI
```

#### 创建 Release

```powershell
# 创建 Release（自动从标签读取信息）
gh release create v1.0.0 \
  --title "🚀 v1.0.0 - 迷你翻译小工具正式发布" \
  --notes-file RELEASE_NOTES.md \
  dist/迷你翻译小工具 -1.0.0-Portable.exe \
  dist/使用说明.txt
```

### 方式 B: 手动在 GitHub 网页创建

#### 步骤

1. **访问项目页面**
   ```
   https://github.com/Bluecap666/MiniTranslator
   ```

2. **点击 "Releases"**
   - 在右侧边栏找到 "Releases"
   - 点击 "Create a new release"

3. **填写发布信息**
   ```
   Tag version: v1.0.0
   Release title: 🚀 v1.0.0 - 迷你翻译小工具正式发布
   ```

4. **编写发布说明**
   
   复制以下内容到描述框：

5. **上传附件**
   - 拖拽上传以下文件：
     - `dist/迷你翻译小工具 -1.0.0-Portable.exe` (约 66MB)
     - `dist/使用说明.txt`

6. **勾选选项**
   - ✅ Set as the latest release

7. **点击 "Publish release"**

---

## 📋 第五步：创建发布说明文件

### RELEASE_NOTES.md 模板

创建一个名为 `RELEASE_NOTES.md` 的文件，内容如下：
