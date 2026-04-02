# 自动化打包压缩脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  迷你翻译小工具 - 自动打包压缩" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 清理旧的 dist 目录
Write-Host "🗑️  清理旧的 dist 目录..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✓ 清理完成" -ForegroundColor Green
} else {
    Write-Host "ℹ  dist 目录不存在，跳过清理" -ForegroundColor Gray
}
Write-Host ""

# 步骤 2: 执行打包
Write-Host "📦 开始打包..." -ForegroundColor Cyan
Write-Host ""

$buildSuccess = $false
try {
    & npm run build
    if ($LASTEXITCODE -eq 0) {
        $buildSuccess = $true
        Write-Host ""
        Write-Host "✅ 打包成功！" -ForegroundColor Green
    }
} catch {
    Write-Host ""
    Write-Host "❌ 打包失败：$($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

if (-not $buildSuccess) {
    Write-Host "❌ 打包过程出错" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 步骤 3: 查找生成的 exe
Write-Host "🔍 查找生成的 exe 文件..." -ForegroundColor Cyan
$portableExe = Get-ChildItem -Path "dist" -Filter "*Portable.exe" -File | Select-Object -First 1

if (-not $portableExe) {
    Write-Host "❌ 未找到便携版 exe 文件" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 找到文件：$($portableExe.Name)" -ForegroundColor Green
$originalSize = $portableExe.Length
Write-Host "  大小：$([math]::Round($originalSize / 1MB, 2)) MB" -ForegroundColor White
Write-Host ""

# 步骤 4: 备份原文件
Write-Host "💾 创建备份..." -ForegroundColor Yellow
$backupPath = $portableExe.FullName + ".backup"
Copy-Item $portableExe.FullName $backupPath
Write-Host "✓ 备份完成" -ForegroundColor Green
Write-Host ""

# 步骤 5: UPX 压缩
Write-Host "🗜️  开始 UPX 压缩（最大压缩级别）..." -ForegroundColor Cyan
Write-Host ""

try {
    & upx --best -9 $portableExe.FullName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ 压缩成功！" -ForegroundColor Green
        Write-Host ""
        
        $compressedSize = (Get-Item $portableExe.FullName).Length
        $compressionRatio = [math]::Round((1 - $compressedSize / $originalSize) * 100, 2)
        $savedSize = [math]::Round(($originalSize - $compressedSize) / 1MB, 2)
        
        Write-Host "📊 压缩结果统计：" -ForegroundColor Cyan
        Write-Host "  ┌────────────────────────────┐" -ForegroundColor Gray
        Write-Host "  │ 压缩前：$([math]::Round($originalSize / 1MB, 2)) MB" -ForegroundColor White
        Write-Host "  │ 压缩后：$([math]::Round($compressedSize / 1MB, 2)) MB" -ForegroundColor Green
        Write-Host "  │ 压缩率：${compressionRatio}%" -ForegroundColor Cyan
        Write-Host "  │ 节省：${savedSize} MB" -ForegroundColor Yellow
        Write-Host "  └────────────────────────────┘" -ForegroundColor Gray
        Write-Host ""
        
        # 删除备份
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
Write-Host "  完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 显示最终文件信息
Write-Host "📦 最终文件列表：" -ForegroundColor Cyan
Get-ChildItem -Path "dist" -File | Format-Table Name, @{Label="大小 (MB)";Expression={[math]::Round($_.Length/1MB,2)}}, LastWriteTime -AutoSize

Write-Host ""
Write-Host "💡 提示：" -ForegroundColor Yellow
Write-Host "  最终的可执行文件位于：dist\$($portableExe.Name)" -ForegroundColor White
Write-Host "  记得将 config.json 和 使用说明.txt 也复制到 dist 目录！" -ForegroundColor Cyan
Write-Host ""
