// 窗口控制
const minimizeBtn = document.getElementById('minimizeBtn');
const closeBtn = document.getElementById('closeBtn');
const settingsBtn = document.getElementById('settingsBtn');

if (minimizeBtn) {
  minimizeBtn.addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    // 关闭时隐藏到托盘，而不是退出程序
    window.electronAPI.closeWindow();
  });
}

// 显示配置窗口（独立窗口）
if (settingsBtn) {
  settingsBtn.addEventListener('click', () => {
    window.electronAPI.openConfigWindow();
  });
}

// 翻译功能
const translateBtn = document.getElementById('translateBtn');
const clearBtn = document.getElementById('clearBtn');
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');

let translateTimeout = null;

// 多平台翻译
async function doMultiTranslate() {
  const text = inputText.value.trim();
  if (!text) {
    outputText.innerHTML = '';
    return;
  }

  outputText.innerHTML = '<div style="color: #999;">翻译中...</div>';
  translateBtn.disabled = true;

  try {
    // 获取所有已配置的服务
    const config = await window.electronAPI.loadConfig();
    const availableServices = [];
    
    // 检查每个服务的配置
    if (config.success && config.config) {
      // Google 总是可用
      availableServices.push({ value: 'google', label: 'Google 翻译' });
      
      // 检查其他服务
      if (config.config.baidu && config.config.baidu.appId && config.config.baidu.secret) {
        availableServices.push({ value: 'baidu', label: '百度翻译' });
      }
      if (config.config.youdao && config.config.youdao.appId && config.config.youdao.secret) {
        availableServices.push({ value: 'youdao', label: '有道翻译' });
      }
      if (config.config.caiyun && config.config.caiyun.token) {
        availableServices.push({ value: 'caiyun', label: '彩云小译' });
      }
      if (config.config.deepl && config.config.deepl.key) {
        availableServices.push({ value: 'deepl', label: 'DeepL' });
      }
      if (config.config.tencent && config.config.tencent.secretId && config.config.tencent.secretKey) {
        availableServices.push({ value: 'tencent', label: '腾讯翻译' });
      }
      if (config.config.qwen && config.config.qwen.apiKey) {
        availableServices.push({ value: 'qwen', label: '通义千问' });
      }
      if (config.config.ernie && config.config.ernie.apiKey) {
        availableServices.push({ value: 'ernie', label: '文心一言' });
      }
    }
    
    // 如果没有可用的服务
    if (availableServices.length === 0) {
      outputText.innerHTML = '<div style="color: #ff4d4f;">⚠ 请先在配置窗口配置至少一个翻译服务</div>';
      translateBtn.disabled = false;
      return;
    }
    
    // 并行调用所有可用服务 + 超时控制
    const timeout = 8000; // 8 秒超时
    const promises = availableServices.map(async (service) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const result = await Promise.race([
          window.electronAPI.translate(text, 'auto', 'zh', service.value),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('超时')), timeout)
          )
        ]);
        clearTimeout(timeoutId);
        return {
          success: result.success,
          service: service.label,
          result: result.result,
          error: result.error
        };
      } catch (error) {
        clearTimeout(timeoutId);
        return {
          success: false,
          service: service.label,
          error: error.message || '请求超时'
        };
      }
    });
    
    const results = await Promise.all(promises);
    
    // 构建输出 HTML - 简洁的"平台：结果"格式
    let outputHTML = '<div class="multi-translate-results">';
    
    results.forEach((item) => {
      if (item.success) {
        outputHTML += `
          <div style="margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid rgba(0, 0, 0, 0.05);">
            <div style="font-size: 12px; color: #667eea; font-weight: 600; margin-bottom: 4px;">
              ${item.service}
            </div>
            <div style="font-size: 14px; line-height: 1.6; color: #333; padding-left: 12px; border-left: 2px solid #667eea;">
              ${item.result}
            </div>
          </div>
        `;
      }
    });
    
    // 添加失败的提示（可选）
    const failedServices = results.filter(item => !item.success);
    if (failedServices.length > 0) {
      outputHTML += `
        <div style="margin-top: 12px; padding: 8px; background: #fff1f0; border-radius: 4px; font-size: 12px; color: #ff4d4f;">
          ⚠ 以下服务不可用或超时：${failedServices.map(item => item.service).join(', ')}
        </div>
      `;
    }
    
    outputHTML += '</div>';
    outputText.innerHTML = outputHTML;
    
  } catch (error) {
    outputText.innerHTML = '<div style="color: #ff4d4f;">翻译出错：' + error.message + '</div>';
  } finally {
    translateBtn.disabled = false;
  }
}

// 点击翻译按钮
if (translateBtn) {
  translateBtn.addEventListener('click', doMultiTranslate);
}

// 点击清空按钮
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    inputText.value = '';
    outputText.innerHTML = '';
    inputText.focus();
  });
}

// 输入框回车翻译（Ctrl+Enter）
if (inputText) {
  inputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      doMultiTranslate();
    }
  });

  // 自动翻译（防抖）
  inputText.addEventListener('input', () => {
    if (translateTimeout) {
      clearTimeout(translateTimeout);
    }
    
    translateTimeout = setTimeout(() => {
      if (inputText.value.trim()) {
        doMultiTranslate();
      }
    }, 1000); // 1 秒后自动翻译
  });
}
