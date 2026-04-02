# 🚀 自动化 GitHub 发布脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  迷你翻译小工具 - GitHub 发布助手" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 检查打包文件
Write-Host "🔍 检查打包文件..." -ForegroundColor Yellow
$portableExe = Get-ChildItem -Path "dist" -Filter "*Portable.exe" -File | Select-Object -First 1

if (-not $portableExe) {
    Write-Host "❌ 未找到便携版 exe 文件，请先运行：npm run build" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 找到文件：$($portableExe.Name)" -ForegroundColor Green
Write-Host "  大小：$([math]::Round($portableExe.Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host ""

# 步骤 2: 初始化 Git（如果需要）
Write-Host "📦 检查 Git 仓库状态..." -ForegroundColor Cyan
try {
    $gitStatus = git rev-parse --git-dir 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  未检测到 Git 仓库，正在初始化..." -ForegroundColor Yellow
        git init
        Write-Host "✓ Git 仓库初始化完成" -ForegroundColor Green
    } else {
        Write-Host "✓ Git 仓库已存在" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  初始化 Git 仓库..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git 仓库初始化完成" -ForegroundColor Green
}
Write-Host ""

# 步骤 3: 配置用户信息（如果需要）
Write-Host "⚙️  检查 Git 用户配置..." -ForegroundColor Cyan
$gitUser = git config user.name 2>&1
if (-not $gitUser) {
    Write-Host "ℹ️  请设置 Git 用户名：" -ForegroundColor Yellow
    $username = Read-Host "输入 GitHub 用户名"
    git config user.name $username
    
    Write-Host "ℹ️  请设置 Git 邮箱：" -ForegroundColor Yellow
    $email = Read-Host "输入 GitHub 邮箱"
    git config user.email $email
    
    Write-Host "✓ Git 用户配置完成" -ForegroundColor Green
} else {
    Write-Host "✓ Git 用户已配置：$gitUser" -ForegroundColor Green
}
Write-Host ""

# 步骤 4: 添加远程仓库
Write-Host "🔗 检查远程仓库配置..." -ForegroundColor Cyan
$remoteUrl = git remote get-url origin 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ℹ️  添加远程仓库..." -ForegroundColor Yellow
    $repoUrl = "https://github.com/Bluecap666/MiniTranslator.git"
    git remote add origin $repoUrl
    Write-Host "✓ 远程仓库已添加：$repoUrl" -ForegroundColor Green
} else {
    Write-Host "✓ 远程仓库已配置：$remoteUrl" -ForegroundColor Green
}
Write-Host ""

# 步骤 5: 添加并提交文件
Write-Host "📝 添加文件到暂存区..." -ForegroundColor Cyan
git add .
Write-Host "✓ 文件已添加" -ForegroundColor Green
Write-Host ""

Write-Host "💬 输入提交信息：" -ForegroundColor Yellow
Write-Host "推荐格式：✨ 功能描述 / 🐛 Bug 修复 / 📝 文档更新 / 📦 发布版本" -ForegroundColor Gray
$commitMessage = Read-Host "提交信息"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "🚀 Release v1.0.0 - 迷你翻译小工具正式发布"
    Write-Host "ℹ️  使用默认提交信息：$commitMessage" -ForegroundColor Yellow
}

git commit -m $commitMessage
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ 提交成功" -ForegroundColor Green
} else {
    Write-Host "⚠️  没有需要提交的文件更改" -ForegroundColor Yellow
}
Write-Host ""

# 步骤 6: 推送到 GitHub
Write-Host "🌿 推送到 GitHub..." -ForegroundColor Cyan
$currentBranch = git branch --show-current
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    $currentBranch = "main"
    git branch -M main
}

Write-Host "ℹ️  当前分支：$currentBranch" -ForegroundColor White
Write-Host "📤 推送代码到 GitHub..." -ForegroundColor Yellow

git push -u origin $currentBranch
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 推送成功！" -ForegroundColor Green
    Write-Host "🌐 访问项目：https://github.com/Bluecap666/MiniTranslator" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  推送失败，可能需要认证" -ForegroundColor Yellow
    Write-Host "💡 提示：请检查网络连接或 Git 凭证" -ForegroundColor Gray
}
Write-Host ""

# 步骤 7: 创建版本标签
Write-Host "🏷️  创建版本标签..." -ForegroundColor Cyan
$existingTags = git tag -l "v1.0.0"
if ([string]::IsNullOrWhiteSpace($existingTags)) {
    git tag -a v1.0.0 -m "🚀 Release v1.0.0 - 迷你翻译小工具正式发布"
    Write-Host "✓ 标签 v1.0.0 已创建" -ForegroundColor Green
    
    Write-Host "📤 推送标签到 GitHub..." -ForegroundColor Yellow
    git push origin v1.0.0
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 标签推送成功！" -ForegroundColor Green
    } else {
        Write-Host "⚠️  标签推送失败" -ForegroundColor Yellow
    }
} else {
    Write-Host "ℹ️  标签 v1.0.0 已存在，跳过创建" -ForegroundColor Yellow
}
Write-Host ""

# 步骤 8: 创建 Release 的提示
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  下一步：创建 GitHub Release" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 请选择创建 Release 的方式：" -ForegroundColor Yellow
Write-Host "  1. 使用 GitHub CLI 自动创建（推荐）" -ForegroundColor White
Write-Host "  2. 手动在 GitHub 网页创建" -ForegroundColor White
Write-Host ""

$choice = Read-Host "请选择 (1/2)"

if ($choice -eq "1") {
    # 检查是否安装 gh
    $ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
    if ($ghInstalled) {
        Write-Host "🔐 检查 GitHub CLI 登录状态..." -ForegroundColor Yellow
        try {
            $ghStatus = gh auth status 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Host "⚠️  未登录 GitHub，正在认证..." -ForegroundColor Yellow
                gh auth login
            }
            
            Write-Host "📦 创建 GitHub Release..." -ForegroundColor Cyan
            gh release create v1.0.0 `
              --title "🚀 v1.0.0 - 迷你翻译小工具正式发布" `
              --notes-file RELEASE_NOTES.md `
              dist\迷你翻译小工具 -1.0.0-Portable.exe `
              dist\使用说明.txt
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Release 创建成功！" -ForegroundColor Green
                Write-Host "🌐 查看 Release: https://github.com/Bluecap666/MiniTranslator/releases/tag/v1.0.0" -ForegroundColor Cyan
            } else {
                Write-Host "❌ Release 创建失败" -ForegroundColor Red
            }
        } catch {
            Write-Host "❌ 发生错误：$($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ 未安装 GitHub CLI (gh)" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 安装方法：" -ForegroundColor Yellow
        Write-Host "  方法 1: winget install --id GitHub.cli" -ForegroundColor White
        Write-Host "  方法 2: choco install gh" -ForegroundColor White
        Write-Host ""
        Write-Host "或者选择方式 2：手动在 GitHub 网页创建" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "📋 手动创建 Release 的步骤：" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host ""
    Write-Host "1️⃣  访问项目页面" -ForegroundColor White
    Write-Host "   https://github.com/Bluecap666/MiniTranslator" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2️⃣  点击右侧 'Releases' → 'Create a new release'" -ForegroundColor White
    Write-Host ""
    Write-Host "3️⃣  填写发布信息" -ForegroundColor White
    Write-Host "   Tag version: v1.0.0" -ForegroundColor Gray
    Write-Host "   Release title: 🚀 v1.0.0 - 迷你翻译小工具正式发布" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4️⃣  复制 RELEASE_NOTES.md 内容到描述框" -ForegroundColor White
    Write-Host ""
    Write-Host "5️⃣  上传附件" -ForegroundColor White
    Write-Host "   - 迷你翻译小工具 -1.0.0-Portable.exe (约 66MB)" -ForegroundColor Gray
    Write-Host "   - 使用说明.txt" -ForegroundColor Gray
    Write-Host ""
    Write-Host "6️⃣  勾选 'Set as the latest release'" -ForegroundColor White
    Write-Host ""
    Write-Host "7️⃣  点击 'Publish release'" -ForegroundColor White
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  发布流程完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 显示最终统计
Write-Host "📊 发布统计：" -ForegroundColor Cyan
Write-Host "  ┌────────────────────────────────────┐" -ForegroundColor Gray
Write-Host "  │ 版本号：v1.0.0                     │" -ForegroundColor White
Write-Host "  │ 可执行文件：$($portableExe.Name)" -ForegroundColor White
Write-Host "  │ 文件大小：$([math]::Round($portableExe.Length / 1MB, 2)) MB                      │" -ForegroundColor White
Write-Host "  │ 项目地址：https://github.com/Bluecap666/MiniTranslator │" -ForegroundColor Cyan
Write-Host "  └────────────────────────────────────┘" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 提示：" -ForegroundColor Yellow
Write-Host "  - 所有文档文件已准备就绪（README.md, RELEASE_NOTES.md, 使用说明.txt）" -ForegroundColor White
Write-Host "  - 打包文件位于：dist\$($portableExe.Name)" -ForegroundColor White
Write-Host "  - 记得在 GitHub 上创建 Release 并上传附件" -ForegroundColor White
Write-Host ""
