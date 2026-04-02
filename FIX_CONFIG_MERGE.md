# 🔧 修复 API 测试配置丢失问题

## 🐛 问题描述

**用户反馈**: 
- ❌ 单个 API 测试后提示"所有 API 服务不可用"
- ❌ 重新打开配置窗口，之前配置的 API 都变成空白了
- ❌ config.json 中的配置还在，但界面不显示

## 🔍 根本原因

### 错误的代码逻辑

**修改前** (config-window.html 第 298-316 行):

```javascript
// 保存临时配置以便测试
const tempConfig = {
  service: service,
  baidu: service === 'baidu' ? configFields : {},      // ← 问题所在!
  youdao: service === 'youdao' ? configFields : {},    // ← 其他服务变空对象
  caiyun: service === 'caiyun' ? configFields : {},
  deepl: service === 'deepl' ? configFields : {},
  tencent: service === 'tencent' ? configFields : {},
  qwen: service === 'qwen' ? configFields : {},
  ernie: service === 'ernie' ? configFields : {}
};

// 直接覆盖保存
await window.electronAPI.saveConfig(tempConfig);
```

### 问题分析

#### 场景重现

**假设用户配置了百度翻译并测试**:

1. **初始状态** (config.json):
```json
{
  "service": "baidu",
  "baidu": {
    "appId": "123456",
    "secret": "abcdefg"
  },
  "youdao": {
    "appId": "789012",
    "secret": "hijklmn"
  },
  "deepl": {
    "key": "opqrst"
  }
}
```

2. **点击"测试百度翻译"** → 生成 tempConfig:
```javascript
tempConfig = {
  service: "baidu",
  baidu: { appId: "123456", secret: "abcdefg" },  // ✓ 有值
  youdao: {},  // ✗ 空对象!
  deepl: {},   // ✗ 空对象!
  // ... 其他都是空对象
}
```

3. **保存后** (config.json 被覆盖):
```json
{
  "service": "baidu",
  "baidu": {
    "appId": "123456",
    "secret": "abcdefg"
  },
  "youdao": {},    // ← 空了!
  "deepl": {}      // ← 空了!
}
```

4. **重新打开配置窗口**:
- ❌ 有道翻译的输入框是空的
- ❌ DeepL 的输入框是空的
- ❌ 只有百度翻译还有值

5. **点击多平台翻译**:
- ❌ 提示"以下服务不可用：有道翻译、DeepL"

### 为什么会这样？

**核心问题**: 
```javascript
// 这种写法是错误的!
youdao: service === 'youdao' ? configFields : {}
//                    ↑
//              如果不是测试有道，就设置为空对象
```

**结果**: 每次测试一个服务，其他服务的配置都被清空！

## ✅ 解决方案

### 正确的代码逻辑

**修改后** (config-window.html 第 293-330 行):

```javascript
// 1. 先加载现有配置
let existingConfig = {};
try {
  const result = await window.electronAPI.loadConfig();
  if (result.success && result.config) {
    existingConfig = result.config;
  }
} catch (error) {
  console.error('[Config Window] 加载现有配置失败:', error);
}

// 2. 合并配置（保留所有现有配置）
const mergedConfig = {
  ...existingConfig,  // ← 展开运算符，复制所有现有配置
  service: service
};

// 3. 只更新当前测试的服务
if (service === 'baidu') {
  mergedConfig.baidu = configFields;  // 只更新百度
} else if (service === 'youdao') {
  mergedConfig.youdao = configFields; // 只更新有道
} else if (service === 'deepl') {
  mergedConfig.deepl = configFields;  // 只更新 DeepL
}
// ... 其他服务类似

// 4. 保存合并后的配置
await window.electronAPI.saveConfig(mergedConfig);
```

### 修复后的流程

**同样的场景**:

1. **初始状态** (config.json):
```json
{
  "baidu": { "appId": "123456", "secret": "abcdefg" },
  "youdao": { "appId": "789012", "secret": "hijklmn" },
  "deepl": { "key": "opqrst" }
}
```

2. **点击"测试百度翻译"**:
```javascript
// 加载现有配置
existingConfig = {
  baidu: { appId: "123456", secret: "abcdefg" },
  youdao: { appId: "789012", secret: "hijklmn" },
  deepl: { key: "opqrst" }
}

// 合并配置
mergedConfig = { ...existingConfig, service: "baidu" }
mergedConfig.baidu = configFields  // 只更新百度
```

3. **保存后** (config.json):
```json
{
  "service": "baidu",
  "baidu": { "appId": "123456", "secret": "abcdefg" },  // ✓ 更新了
  "youdao": { "appId": "789012", "secret": "hijklmn" }, // ✓ 保留了
  "deepl": { "key": "opqrst" }                          // ✓ 保留了
}
```

4. **重新打开配置窗口**:
- ✅ 百度翻译有值
- ✅ 有道翻译有值
- ✅ DeepL 有值

5. **点击多平台翻译**:
- ✅ 所有配置过的服务都能用

## 📊 对比总结

| 项目 | 修改前 | 修改后 |
|------|--------|--------|
| **配置策略** | 覆盖式 | 合并式 |
| **测试百度** | 清空其他服务 | 保留其他服务 |
| **测试有道** | 清空其他服务 | 保留其他服务 |
| **数据完整性** | ❌ 差 | ✅ 优秀 |
| **用户体验** | ⭐ | ⭐⭐⭐⭐⭐ |

## 🎯 代码变更详解

### 修改位置
**文件**: `config-window.html`  
**行号**: 第 293-330 行

### 关键改动

#### 1. 添加配置加载
```javascript
// 新增：先加载现有配置
let existingConfig = {};
try {
  const result = await window.electronAPI.loadConfig();
  if (result.success && result.config) {
    existingConfig = result.config;
  }
} catch (error) {
  console.error('[Config Window] 加载现有配置失败:', error);
}
```

#### 2. 使用展开运算符合并
```javascript
// 新增：合并配置
const mergedConfig = {
  ...existingConfig,  // 保留所有现有配置
  service: service    // 更新当前服务
};
```

#### 3. 条件更新当前服务
```javascript
// 修改：只更新当前测试的服务
if (service === 'baidu') {
  mergedConfig.baidu = configFields;
} else if (service === 'youdao') {
  mergedConfig.youdao = configFields;
}
// ... 而不是像之前那样全部设置为空对象
```

#### 4. 保存合并后的配置
```javascript
// 修改：保存完整的配置
await window.electronAPI.saveConfig(mergedConfig);
console.log('[Config Window] 配置已合并保存');
```

## 🧪 测试验证

### 测试步骤

#### 测试 1: 配置多个服务
```
1. 打开配置窗口
2. 配置百度翻译
3. 配置有道翻译
4. 配置 DeepL
5. 点击"保存配置"
6. 关闭配置窗口
7. 重新打开配置窗口

预期结果:
✓ 三个服务的配置都还在
```

#### 测试 2: 测试单个服务
```
1. 在配置窗口点击"测试百度翻译"
2. 等待测试完成
3. 不要点保存，直接关闭窗口
4. 重新打开配置窗口
5. 检查各个服务

预期结果:
✓ 百度翻译的配置在
✓ 有道翻译的配置在
✓ DeepL 的配置在
✓ 所有服务都可用
```

#### 测试 3: 多平台翻译
```
1. 输入文本
2. 点击"翻译"按钮
3. 查看结果

预期结果:
✓ 显示所有已配置服务的翻译结果
✓ 不会提示"服务不可用"
```

## 💡 经验教训

### 1. 避免覆盖式更新

**错误做法**:
```javascript
const newConfig = {
  field1: value1,
  field2: value2
  // 没有提到的字段都会丢失
};
```

**正确做法**:
```javascript
const existingConfig = await loadConfig();
const newConfig = {
  ...existingConfig,  // 保留所有现有字段
  field1: value1,     // 更新特定字段
  field2: value2
};
```

### 2. 使用展开运算符

```javascript
// ES6 展开运算符
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };
// 结果：{ a: 1, b: 2, c: 3 }
```

### 3. 配置更新的通用模式

```javascript
// 1. 加载现有配置
const existing = await loadConfig();

// 2. 合并新旧配置
const merged = {
  ...existing,
  updatedField: newValue
};

// 3. 保存合并后的配置
await saveConfig(merged);
```

## 🎉 总结

通过这次修复:

1. ✅ **修复了配置丢失问题** - 测试不会清空其他服务
2. ✅ **改进了代码逻辑** - 使用合并而非覆盖
3. ✅ **提升了用户体验** - 配置更加可靠
4. ✅ **增加了日志输出** - 便于调试

**核心改进**:
```javascript
// 从：覆盖式保存
const tempConfig = { service, baidu: ..., youdao: {} } // 错误!

// 到：合并式保存
const mergedConfig = { ...existingConfig, baidu: configFields } // 正确!
```

---

**修复日期**: 2026-04-02  
**修复版本**: v2.5.2  
**状态**: ✅ 已完成并测试通过
