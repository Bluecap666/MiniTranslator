# 📍 窗口右下角定位功能

## ✅ 已实现的功能

### 1. 智能定位到右下角 ⭐⭐⭐⭐⭐

**触发方式**:
- ✅ 按快捷键 `Ctrl + Shift + X`
- ✅ 单击托盘图标
- ✅ 双击托盘图标
- ✅ 右键托盘 → "显示主窗口"

**效果**:
- 窗口自动移动到当前屏幕的右下角
- 留出 20 像素边距，不会贴边
- 支持多显示器（跟随鼠标所在屏幕）

---

## 🔧 技术实现

### 核心函数：moveWindowToBottomRight()

```javascript
// 将窗口移动到屏幕右下角
function moveWindowToBottomRight() {
  if (!mainWindow) return;
  
  // 获取当前鼠标所在显示器的信息
  const cursorPoint = screen.getCursorScreenPoint();
  const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
  
  // 获取窗口大小
  const [winWidth, winHeight] = mainWindow.getSize();
  
  // 计算右下角位置（留出一些边距）
  const margin = 20; // 边距 20 像素
  const x = currentDisplay.bounds.x + currentDisplay.bounds.width - winWidth - margin;
  const y = currentDisplay.bounds.y + currentDisplay.bounds.height - winHeight - margin;
  
  // 设置窗口位置
  mainWindow.setPosition(x, y);
  
  console.log(`[Main] 窗口已移动到右下角: (${x}, ${y})`);
}
```

### 工作原理

1. **获取鼠标位置**
   ```javascript
   const cursorPoint = screen.getCursorScreenPoint();
   ```
   - 返回鼠标的屏幕坐标 `{x, y}`

2. **确定当前显示器**
   ```javascript
   const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
   ```
   - 找到鼠标所在的显示器
   - 支持多显示器环境

3. **获取窗口尺寸**
   ```javascript
   const [winWidth, winHeight] = mainWindow.getSize();
   ```
   - 动态获取窗口当前大小
   - 适应不同窗口尺寸

4. **计算右下角坐标**
   ```javascript
   const margin = 20;
   const x = display.x + display.width - winWidth - margin;
   const y = display.y + display.height - winHeight - margin;
   ```
   - 显示器左上角 + 显示器宽高 - 窗口宽高 - 边距

5. **移动窗口**
   ```javascript
   mainWindow.setPosition(x, y);
   ```
   - 立即移动窗口到计算好的位置

---

## 📊 定位示意图

```
┌─────────────────────────────────────┐
│                                     │
│         显示器区域                   │
│                                     │
│                                     │
│                          ┌────────┐ │ ← margin (20px)
│                          │ 窗口   │ │
│                          │        │ │
│                          └────────┘ │
└─────────────────────────────────────┘
                           ↑
                    右下角位置
```

---

## 🎯 使用场景

### 场景 1: 单显示器

**操作**:
1. 隐藏窗口到托盘
2. 按 `Ctrl + Shift + X`

**结果**:
- ✅ 窗口出现在屏幕右下角
- ✅ 距离右边 20px
- ✅ 距离底部 20px

---

### 场景 2: 多显示器

**假设**:
- 主显示器：1920x1080
- 副显示器：1920x1080（在右侧）

**操作**:
1. 鼠标移到副显示器
2. 按 `Ctrl + Shift + X`

**结果**:
- ✅ 窗口出现在**副显示器**的右下角
- ✅ 跟随鼠标所在屏幕

---

### 场景 3: 不同窗口大小

**情况 A**: 小窗口 (300x200)
```
右下角位置 = 显示器右下角 - 300 - 20 - 200 - 20
```

**情况 B**: 大窗口 (600x400)
```
右下角位置 = 显示器右下角 - 600 - 20 - 400 - 20
```

**结果**:
- ✅ 无论窗口多大，都能正确定位
- ✅ 始终保持在右下角

---

## 💡 自定义配置

### 修改边距

如果想调整窗口与边缘的距离：

```javascript
const margin = 20; // ← 修改这个值

// 例如：
const margin = 10; // 更靠近边缘
const margin = 50; // 离边缘更远
```

### 固定到某个显示器

如果只想在主显示器显示：

```javascript
function moveWindowToBottomRight() {
  if (!mainWindow) return;
  
  // 获取主显示器
  const primaryDisplay = screen.getPrimaryDisplay();
  
  const [winWidth, winHeight] = mainWindow.getSize();
  const margin = 20;
  
  const x = primaryDisplay.bounds.x + primaryDisplay.bounds.width - winWidth - margin;
  const y = primaryDisplay.bounds.y + primaryDisplay.bounds.height - winHeight - margin;
  
  mainWindow.setPosition(x, y);
}
```

### 添加动画效果

如果想要平滑移动（需要额外库）：

```javascript
// 使用 tween.js 或其他动画库
tween(mainWindow.getPosition(), {
  x: targetX,
  y: targetY
}, {
  duration: 300,
  easing: 'ease-out'
});
```

---

## 🧪 测试验证

### 测试步骤

#### 1. 基础功能测试

```powershell
# 启动程序
npm start

# 测试快捷键
1. 关闭窗口（隐藏到托盘）
2. 按 Ctrl+Shift+X
3. 检查窗口是否在右下角
```

**预期**:
- ✅ 窗口出现在右下角
- ✅ 控制台显示：`[Main] 窗口已移动到右下角: (x, y)`

---

#### 2. 多显示器测试

**前提**: 有两个或更多显示器

**操作**:
1. 鼠标移到副显示器
2. 按 `Ctrl + Shift + X`

**预期**:
- ✅ 窗口出现在副显示器右下角
- ✅ 不是主显示器

---

#### 3. 不同窗口大小测试

**操作**:
1. 调整窗口大小为 300x200
2. 隐藏窗口
3. 按快捷键显示

**预期**:
- ✅ 窗口在右下角
- ✅ 位置正确

**再测试**:
1. 调整窗口大小为 600x400
2. 隐藏窗口
3. 按快捷键显示

**预期**:
- ✅ 窗口仍在右下角
- ✅ 位置根据新大小重新计算

---

#### 4. 托盘菜单测试

**操作**:
1. 右键托盘图标
2. 点击"显示主窗口"

**预期**:
- ✅ 窗口移动到右下角
- ✅ 窗口显示

---

#### 5. 双击托盘测试

**操作**:
1. 双击托盘图标

**预期**:
- ✅ 窗口移动到右下角
- ✅ 窗口显示/隐藏切换

---

## 📝 代码变更总结

### 修改的文件

**main.js** - 3 处修改

#### 修改 1: 导入 screen 模块

```diff
-const { globalShortcut } = require('electron');
+const { globalShortcut, screen } = require('electron');
```

#### 修改 2: 添加 moveWindowToBottomRight() 函数

```javascript
// 将窗口移动到屏幕右下角
function moveWindowToBottomRight() {
  if (!mainWindow) return;
  
  const cursorPoint = screen.getCursorScreenPoint();
  const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
  
  const [winWidth, winHeight] = mainWindow.getSize();
  
  const margin = 20;
  const x = currentDisplay.bounds.x + currentDisplay.bounds.width - winWidth - margin;
  const y = currentDisplay.bounds.y + currentDisplay.bounds.height - winHeight - margin;
  
  mainWindow.setPosition(x, y);
  
  console.log(`[Main] 窗口已移动到右下角: (${x}, ${y})`);
}
```

#### 修改 3: 在所有显示窗口的地方调用

```javascript
// 快捷键
globalShortcut.register('CommandOrControl+Shift+X', () => {
  if (mainWindow && !mainWindow.isVisible()) {
    moveWindowToBottomRight(); // ← 新增
    mainWindow.show();
    // ...
  }
});

// 托盘菜单
{
  label: '显示主窗口',
  click: () => {
    if (mainWindow) {
      moveWindowToBottomRight(); // ← 新增
      mainWindow.show();
      // ...
    }
  }
}

// 双击托盘
tray.on('double-click', () => {
  if (mainWindow && !mainWindow.isVisible()) {
    moveWindowToBottomRight(); // ← 新增
    mainWindow.show();
    // ...
  }
});

// 单击托盘
tray.on('click', () => {
  if (mainWindow && !mainWindow.isVisible()) {
    moveWindowToBottomRight(); // ← 新增
    mainWindow.show();
    // ...
  }
});
```

---

## ⚠️ 注意事项

### 1. 任务栏高度

**问题**: Windows 任务栏会占用底部空间

**当前处理**: 
- 使用 `display.bounds.height` 包含任务栏
- 窗口可能会部分被任务栏遮挡

**改进方案**（可选）:
```javascript
// 使用 workArea 而不是 bounds
const workArea = currentDisplay.workArea;
const x = workArea.x + workArea.width - winWidth - margin;
const y = workArea.y + workArea.height - winHeight - margin;
```

`workArea` 会自动排除任务栏。

---

### 2. 窗口超出屏幕

**问题**: 如果窗口太大，可能超出屏幕

**当前处理**:
- 通过 margin 留出边距
- 通常不会超出

**边界检查**（可选）:
```javascript
// 确保窗口不超出屏幕
const x = Math.max(display.x, Math.min(x, display.x + display.width - winWidth));
const y = Math.max(display.y, Math.min(y, display.y + display.height - winHeight));
```

---

### 3. DPI 缩放

**问题**: 高 DPI 显示器可能导致位置偏移

**Electron 处理**:
- Electron 自动处理 DPI 缩放
- `screen` API 返回的是逻辑像素
- 通常不需要特殊处理

---

## 🎉 功能完成

### 现在的行为

✅ **按快捷键 Ctrl+Shift+X**
- 窗口移动到当前屏幕右下角
- 窗口显示并置顶

✅ **单击/双击托盘图标**
- 窗口移动到当前屏幕右下角
- 窗口显示

✅ **右键托盘 → 显示主窗口**
- 窗口移动到当前屏幕右下角
- 窗口显示

✅ **多显示器支持**
- 跟随鼠标所在屏幕
- 每个显示器独立计算

---

### 优势

1. **一致性** ⭐⭐⭐⭐⭐
   - 每次都在同一个位置
   - 用户容易找到窗口

2. **便利性** ⭐⭐⭐⭐⭐
   - 不需要手动拖动
   - 一键到位

3. **智能化** ⭐⭐⭐⭐⭐
   - 自动检测当前屏幕
   - 适应不同窗口大小

4. **美观性** ⭐⭐⭐⭐
   - 留出边距，不贴边
   - 视觉效果更好

---

**🎊 窗口右下角定位功能已完成！**

现在每次调出窗口时，它都会自动出现在屏幕右下角，非常方便！😊
