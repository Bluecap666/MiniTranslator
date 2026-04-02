const { ipcRenderer } = require('electron');

// 窗口控制
const closeBtn = document.getElementById('closeBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const cancelBtn = document.getElementById('cancelBtn');
const saveConfigBtn = document.getElementById('saveConfigBtn');
const testBtn = document.getElementById('testBtn');

// 关闭窗口 - 使用 preload.js 暴露的 API
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    console.log('[Config UI] 点击了关闭按钮');
    try {
      window.electronAPI.closeConfigWindow();
      console.log('[Config UI] 已发送关闭请求');
    } catch (error) {
      console.error('[Config UI] 发送关闭请求失败:', error);
    }
  });
}

// 最小化窗口
if (minimizeBtn) {
  minimizeBtn.addEventListener('click', () => {
    console.log('[Config UI] 点击了最小化按钮');
    try {
      window.electronAPI.minimizeConfigWindow();
      console.log('[Config UI] 已发送最小化请求');
    } catch (error) {
      console.error('[Config UI] 发送最小化请求失败:', error);
    }
  });
}

// 取消按钮（关闭窗口）
if (cancelBtn) {
  cancelBtn.addEventListener('click', () => {
    console.log('[Config UI] 点击了取消按钮');
    try {
      window.electronAPI.closeConfigWindow();
      console.log('[Config UI] 已发送关闭请求');
    } catch (error) {
      console.error('[Config UI] 发送关闭请求失败:', error);
    }
  });
}

// 切换翻译服务配置显示
const apiServiceSelect = document.getElementById('apiService');
if (apiServiceSelect) {
  apiServiceSelect.addEventListener('change', (e) => {
    const service = e.target.value;
    document.getElementById('baiduConfig').style.display = service === 'baidu' ? 'block' : 'none';
    document.getElementById('youdaoConfig').style.display = service === 'youdao' ? 'block' : 'none';
    document.getElementById('googleConfig').style.display = service === 'google' ? 'block' : 'none';
    document.getElementById('caiyunConfig').style.display = service === 'caiyun' ? 'block' : 'none';
    document.getElementById('deeplConfig').style.display = service === 'deepl' ? 'block' : 'none';
    document.getElementById('tencentConfig').style.display = service === 'tencent' ? 'block' : 'none';
    document.getElementById('qwenConfig').style.display = service === 'qwen' ? 'block' : 'none';
    document.getElementById('ernieConfig').style.display = service === 'ernie' ? 'block' : 'none';
  });
}

// 加载配置
async function loadConfig() {
  try {
    const result = await window.electronAPI.loadConfig();
    if (result.success && result.config) {
      const config = result.config;
      
      // 设置当前服务
      if (apiServiceSelect) {
        apiServiceSelect.value = config.service || 'google';
        
        // 触发 change 事件以显示对应的配置项
        apiServiceSelect.dispatchEvent(new Event('change'));
      }
      
      // 填充百度配置
      if (config.baidu) {
        document.getElementById('baiduAppId').value = config.baidu.appId || '';
        document.getElementById('baiduSecret').value = config.baidu.secret || '';
      }
      
      // 填充有道配置
      if (config.youdao) {
        document.getElementById('youdaoAppId').value = config.youdao.appId || '';
        document.getElementById('youdaoSecret').value = config.youdao.secret || '';
      }
      
      // 填充彩云配置
      if (config.caiyun) {
        document.getElementById('caiyunToken').value = config.caiyun.token || '';
      }
      
      // 填充 DeepL 配置
      if (config.deepl) {
        document.getElementById('deeplKey').value = config.deepl.key || '';
      }
      
      // 填充腾讯配置
      if (config.tencent) {
        document.getElementById('tencentSecretId').value = config.tencent.secretId || '';
        document.getElementById('tencentSecretKey').value = config.tencent.secretKey || '';
      }
      
      // 填充通义千问配置
      if (config.qwen) {
        document.getElementById('qwenApiKey').value = config.qwen.apiKey || '';
      }
      
      // 填充文心一言配置
      if (config.ernie) {
        document.getElementById('ernieApiKey').value = config.ernie.apiKey || '';
      }
    }
  } catch (error) {
    console.error('加载配置失败:', error);
    alert('加载配置失败：' + error.message);
  }
}

// 保存配置
if (saveConfigBtn) {
  saveConfigBtn.addEventListener('click', async () => {
    console.log('保存配置按钮被点击');
    const config = {
      service: apiServiceSelect ? apiServiceSelect.value : 'baidu',
      baidu: {
        appId: document.getElementById('baiduAppId').value,
        secret: document.getElementById('baiduSecret').value
      },
      youdao: {
        appId: document.getElementById('youdaoAppId').value,
        secret: document.getElementById('youdaoSecret').value
      },
      google: {},
      caiyun: {
        token: document.getElementById('caiyunToken').value
      },
      deepl: {
        key: document.getElementById('deeplKey').value
      },
      tencent: {
        secretId: document.getElementById('tencentSecretId').value,
        secretKey: document.getElementById('tencentSecretKey').value
      },
      qwen: {
        apiKey: document.getElementById('qwenApiKey').value
      },
      ernie: {
        apiKey: document.getElementById('ernieApiKey').value
      }
    };
    
    console.log('准备保存配置:', JSON.stringify(config, null, 2));
    
    try {
      const result = await window.electronAPI.saveConfig(config);
      console.log('保存结果:', result);
      
      if (result.success) {
        alert('✓ 配置已保存！');
        setTimeout(() => {
          window.electronAPI.closeConfigWindow();
        }, 500);
      } else {
        alert('✗ 保存失败：' + result.error);
      }
    } catch (error) {
      console.error('保存配置出错:', error);
      alert('✗ 保存失败：' + error.message);
    }
  });
}

// 测试连接（简单实现）
if (testBtn) {
  testBtn.addEventListener('click', async () => {
    console.log('测试连接按钮被点击');
    const service = apiServiceSelect ? apiServiceSelect.value : 'baidu';
    
    if (service === 'google') {
      alert('✓ Google 翻译无需测试，可直接使用');
      return;
    }
    
    // 检查配置是否填写
    let hasConfig = false;
    if (service === 'baidu') {
      hasConfig = document.getElementById('baiduAppId').value && document.getElementById('baiduSecret').value;
    } else if (service === 'youdao') {
      hasConfig = document.getElementById('youdaoAppId').value && document.getElementById('youdaoSecret').value;
    } else if (service === 'caiyun') {
      hasConfig = document.getElementById('caiyunToken').value;
    } else if (service === 'deepl') {
      hasConfig = document.getElementById('deeplKey').value;
    } else if (service === 'tencent') {
      hasConfig = document.getElementById('tencentSecretId').value && document.getElementById('tencentSecretKey').value;
    } else if (service === 'qwen') {
      hasConfig = document.getElementById('qwenApiKey').value;
    } else if (service === 'ernie') {
      hasConfig = document.getElementById('ernieApiKey').value;
    }
    
    if (!hasConfig) {
      alert('⚠ 请先填写 API 配置信息');
      return;
    }
    
    testBtn.disabled = true;
    testBtn.textContent = '测试中...';
    
    try {
      // 简单的测试翻译
      const result = await window.electronAPI.translate('Hello', 'en', 'zh', service);
      
      console.log('测试结果:', result);
      
      if (result.success) {
        alert('✓ 连接成功！\n翻译结果：' + result.result);
      } else {
        alert('✗ 连接失败：' + result.error);
      }
    } catch (error) {
      console.error('测试出错:', error);
      alert('✗ 测试失败：' + error.message);
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = '测试连接';
    }
  });
}

// 初始化加载配置
loadConfig();
