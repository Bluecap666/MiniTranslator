# UPX 压缩脚本 - 进一步减小体积

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  UPX 压缩工具 - 迷你翻译小工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 UPX 是否安装
$upxPath = Get-Command upx -ErrorAction SilentlyContinue

if (-not $upxPath) {
    Write-Host "❌ 未找到 UPX，请先安装 UPX：" -ForegroundColor Red
    Write-Host ""
    Write-Host "方法 1: 使用 Chocolatey" -ForegroundColor Yellow
    Write-Host "  choco install upx" -ForegroundColor White
    Write-Host ""
    Write-Host "方法 2: 手动下载安装" -ForegroundColor Yellow
    Write-Host "  1. 访问：https://github.com/upx/upx/releases" -ForegroundColor White
    Write-Host "  2. 下载 upx-4.x.x-win64.zip" -ForegroundColor White
    Write-Host "  3. 解压并添加到系统 PATH" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✓ UPX 已找到：$($upxPath.Source)" -ForegroundColor Green
Write-Host ""

# 查找打包后的文件
$portableExe = Get-ChildItem -Path "dist" -Filter "*Portable.exe" -File | Select-Object -First 1

if (-not $portableExe) {
    Write-Host "❌ 未找到便携版可执行文件" -ForegroundColor Red
    Write-Host "请先运行：npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 找到文件：" -ForegroundColor Cyan
Write-Host "  $($portableExe.Name)" -ForegroundColor White
Write-Host "  大小：$([math]::Round($portableExe.Length / 1MB, 2)) MB" -ForegroundColor White
Write-Host ""

# 备份原文件
$backupPath = $portableExe.FullName + ".backup"
Write-Host "💾 创建备份..." -ForegroundColor Yellow
Copy-Item $portableExe.FullName $backupPath
Write-Host "✓ 备份完成：$($portableExe.Name).backup" -ForegroundColor Green
Write-Host ""

# 执行 UPX 压缩
Write-Host "🗜️  开始 UPX 压缩（最大压缩级别）..." -ForegroundColor Cyan
Write-Host ""

$originalSize = $portableExe.Length

try {
    # UPX 参数：--best 最大压缩，-9 最高压缩级别
    & upx --best -9 $portableExe.FullName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 压缩成功！" -ForegroundColor Green
        Write-Host ""
        
        $compressedSize = (Get-Item $portableExe.FullName).Length
        $compressionRatio = [math]::Round((1 - $compressedSize / $originalSize) * 100, 2)
        
        Write-Host "📊 压缩结果：" -ForegroundColor Cyan
        Write-Host "  压缩前：$([math]::Round($originalSize / 1MB, 2)) MB" -ForegroundColor White
        Write-Host "  压缩后：$([math]::Round($compressedSize / 1MB, 2)) MB" -ForegroundColor White
        Write-Host "  压缩率：${compressionRatio}%" -ForegroundColor Green
        Write-Host "  节省：$([math]::Round(($originalSize - $compressedSize) / 1MB, 2)) MB" -ForegroundColor Green
        Write-Host ""
        
        # 删除备份（如果压缩成功）
        $choice = Read-Host "是否删除备份文件？(Y/N)"
        if ($choice -eq 'Y' -or $choice -eq 'y') {
            Remove-Item $backupPath
            Write-Host "✓ 备份已删除" -ForegroundColor Green
        } else {
            Write-Host "ℹ  备份保留：$($portableExe.Name).backup" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host ""
        Write-Host "❌ 压缩失败！" -ForegroundColor Red
        Write-Host "正在恢复原始文件..." -ForegroundColor Yellow
        Copy-Item $backupPath $portableExe.FullName -Force
        Write-Host "✓ 已恢复到压缩前的状态" -ForegroundColor Green
    }
} catch {
    Write-Host ""
    Write-Host "❌ 发生错误：$($_.Exception.Message)" -ForegroundColor Red
    Write-Host "正在恢复原始文件..." -ForegroundColor Yellow
    if (Test-Path $backupPath) {
        Copy-Item $backupPath $portableExe.FullName -Force
        Write-Host "✓ 已恢复到压缩前的状态" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
