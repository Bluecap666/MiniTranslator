const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// 配置文件路径 - 使用 exe 所在目录（便携版设计）
let configPath;

if (process.env.PORTABLE_EXECUTABLE_FILE) {
  // 便携版：使用 exe 所在目录
  configPath = path.join(path.dirname(process.env.PORTABLE_EXECUTABLE_FILE), 'config.json');
} else if (app.isPackaged) {
  // 已打包但不是便携版：使用 exe 所在目录
  const exePath = app.getPath('exe');
  configPath = path.join(path.dirname(exePath), 'config.json');
} else {
  // 开发环境：使用项目根目录
  configPath = path.join(__dirname, 'config.json');
}

console.log('[Main] 配置文件路径:', configPath);

let mainWindow;
let configWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    minWidth: 300,
    minHeight: 200,
    maxWidth: 800,
    maxHeight: 600,
    frame: false, // 无边框窗口
    transparent: true, // 透明背景
    resizable: true,
    alwaysOnTop: true, // 始终置顶
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('index.html');
  
  // 阻止任务栏图标
  mainWindow.setSkipTaskbar(false);
}

// 创建配置窗口
function createConfigWindow() {
  if (configWindow) {
    // 如果窗口已存在，直接显示
    configWindow.show();
    configWindow.focus();
    return;
  }

  configWindow = new BrowserWindow({
    width: 550,
    height: 700,
    minWidth: 500,
    minHeight: 600,
    maxWidth: 800,
    maxHeight: 900,
    frame: false, // 无边框窗口，使用自定义标题栏
    resizable: true,
    maximizable: false,
    minimizable: true,
    modal: false, // 非模态窗口
    // parent: mainWindow,  // 移除 parent，让配置窗口完全独立
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  configWindow.loadFile('config-window.html');
  
  // 窗口关闭时清空引用
  configWindow.on('closed', () => {
    configWindow = null;
  });
}

// 注册全局快捷键
const { globalShortcut } = require('electron');

app.whenReady().then(() => {
  createWindow();

  // 注册全局快捷键 Ctrl+Shift+X 显示/隐藏窗口
  globalShortcut.register('CommandOrControl+Shift+X', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.setAlwaysOnTop(true);
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 处理最小化
ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

// 处理关闭
ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// 处理隐藏窗口
ipcMain.on('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

// 打开配置窗口
ipcMain.on('open-config-window', () => {
  createConfigWindow();
});

// 关闭配置窗口
ipcMain.on('close-config-window', () => {
  console.log('[Config Window] 收到关闭配置窗口请求');
  console.log('[Config Window] configWindow 存在:', !!configWindow);
  if (configWindow) {
    console.log('[Config Window] 正在关闭窗口...');
    configWindow.close();
    console.log('[Config Window] 窗口已关闭');
  } else {
    console.error('[Config Window] configWindow 不存在，无法关闭');
  }
});

// 最小化配置窗口
ipcMain.on('minimize-config-window', () => {
  console.log('[Config Window] 收到最小化请求');
  if (configWindow) {
    configWindow.minimize();
    console.log('[Config Window] 窗口已最小化');
  } else {
    console.error('[Config Window] configWindow 不存在，无法最小化');
  }
});

// 配置已更新通知
ipcMain.on('config-updated', () => {
  console.log('配置已更新');
  // 这里可以添加通知主窗口刷新配置的逻辑
});

// 保存配置
ipcMain.handle('save-config', async (event, config) => {
  try {
    console.log('[Main] 收到保存配置请求');
    // 立即写入配置文件
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log('[Main] 配置已保存到:', configPath);
    return { success: true };
  } catch (error) {
    console.error('[Main] 保存配置失败:', error);
    return { success: false, error: error.message };
  }
});

// 加载配置
ipcMain.handle('load-config', () => {
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return { success: true, config };
    } else {
      return { 
        success: true, 
        config: {
          service: 'baidu',  // 默认改为百度翻译
          baidu: { appId: '', secret: '' },
          youdao: { appId: '', secret: '' },
          google: {},
          tencent: { secretId: '', secretKey: '' },
          caiyun: { token: '' },
          deepl: { key: '' },
          qwen: { apiKey: '' },    // 通义千问
          ernie: { apiKey: '' }    // 文心一言
        }
      };
    }
  } catch (error) {
    console.error('加载配置失败:', error);
    return { success: false, error: error.message };
  }
});

// 翻译功能
const crypto = require('crypto');
const https = require('https');
const http = require('http');

// 定义所有可用的翻译服务列表
const AVAILABLE_SERVICES = [
  'google', 'caiyun', 'deepl', 'baidu', 'youdao', 'tencent'
];

// AI 翻译服务列表（需要 API Key）
const AI_SERVICES = [
  'qwen',     // 通义千问
  'ernie'     // 文心一言
];

ipcMain.handle('translate', async (event, { text, from, to, service }) => {
  try {
    // 加载配置
    let config;
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } else {
      config = {
        service: 'google',
        baidu: { appId: '', secret: '' },
        youdao: { appId: '', secret: '' },
        google: {},
        tencent: { secretId: '', secretKey: '' },
        caiyun: { token: '' },
        deepl: { key: '' }
      };
    }

    // 如果指定了服务，先尝试使用指定的服务
    if (service) {
      const result = await translateWithService(service, text, from, to, config);
      if (result.success) {
        return result;
      }
      // 如果失败，记录日志并继续尝试其他服务
      console.log(`服务 ${service} 翻译失败: ${result.error}, 尝试其他服务...`);
    }

    // 自动故障切换：按顺序尝试所有可用服务
    for (const svc of AVAILABLE_SERVICES) {
      if (svc === service) continue; // 跳过已经尝试过的服务
      
      console.log(`正在尝试服务：${svc}`);
      const result = await translateWithService(svc, text, from, to, config);
      
      if (result.success) {
        console.log(`服务 ${svc} 翻译成功`);
        return result;
      }
      
      console.log(`服务 ${svc} 翻译失败：${result.error}`);
    }

    return { success: false, error: '所有翻译服务均不可用，请检查网络或 API 配置' };
  } catch (error) {
    console.error('翻译失败:', error);
    return { success: false, error: error.message };
  }
});

// 根据服务名调用对应的翻译函数
async function translateWithService(service, text, from, to, config) {
  switch (service) {
    case 'baidu':
      return await translateBaidu(text, from, to, config.baidu);
    case 'youdao':
      return await translateYoudao(text, from, to, config.youdao);
    case 'google':
      return await translateGoogle(text, from, to);
    case 'tencent':
      return await translateTencent(text, from, to, config.tencent);
    case 'caiyun':
      return await translateCaiyun(text, from, to, config.caiyun);
    case 'deepl':
      return await translateDeepL(text, from, to, config.deepl);
    case 'qwen':
      return await translateQwen(text, from, to, config.qwen);
    case 'ernie':
      return await translateErnie(text, from, to, config.ernie);
    default:
      return { success: false, error: '未知的翻译服务' };
  }
}

// 百度翻译
async function translateBaidu(text, from, to, config) {
  const { appId, secret } = config;
  
  if (!appId || !secret) {
    return { success: false, error: '请先配置百度翻译 API' };
  }

  const salt = Date.now().toString();
  const sign = crypto.createHash('md5').update(appId + text + salt + secret).digest('hex');
  
  const params = new URLSearchParams({
    q: text,
    appid: appId,
    salt: salt,
    from: from || 'zh',
    to: to || 'en',
    sign: sign
  });

  return new Promise((resolve) => {
    https.get(`https://fanyi-api.baidu.com/api/trans/vip/translate?${params}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.trans_result) {
            resolve({ 
              success: true, 
              result: result.trans_result.map(t => t.dst).join('\n') 
            });
          } else {
            resolve({ success: false, error: result.error_msg || '翻译失败' });
          }
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
    }).on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
  });
}

// 有道翻译
async function translateYoudao(text, from, to, config) {
  const { appId, secret } = config;
  
  if (!appId || !secret) {
    return { success: false, error: '请先配置有道翻译 API' };
  }

  const salt = Date.now().toString();
  const sign = crypto.createHash('sha256').update(appId + text + salt + secret).digest('hex');
  
  const params = new URLSearchParams({
    q: text,
    from: from || 'zh_CHS',
    to: to || 'en',
    appKey: appId,
    salt: salt,
    sign: sign,
    signType: 'v3'
  });

  return new Promise((resolve) => {
    https.get(`https://openapi.youdao.com/api?${params}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.translation) {
            resolve({ 
              success: true, 
              result: result.translation.join('\n') 
            });
          } else {
            resolve({ success: false, error: result.msg || '翻译失败' });
          }
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
    }).on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
  });
}

// Google 翻译（使用免费接口）
async function translateGoogle(text, from, to) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from || 'zh-CN'}&tl=${to || 'zh-CN'}&dt=t&q=${encodeURIComponent(text)}`;
  
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result[0] && Array.isArray(result[0])) {
            const translation = result[0].map(item => item[0]).filter(Boolean).join('');
            resolve({ success: true, result: translation });
          } else {
            resolve({ success: false, error: '翻译失败' });
          }
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
    }).on('error', (error) => {
      resolve({ success: false, error: error.message });
    });
  });
}

// 腾讯翻译
async function translateTencent(text, from, to, config) {
  const { secretId, secretKey } = config;
  
  if (!secretId || !secretKey) {
    return { success: false, error: '请先配置腾讯翻译 API' };
  }

  const params = {
    SourceText: text,
    Source: from || 'zh',
    Target: to || 'en',
    ProjectId: 0
  };

  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = Date.now().toString();
  
  const srcStr = `Action=TextTranslate&Language=zh-CN&Nonce=${nonce}&ProjectId=0&Region=ap-guangzhou&SecretId=${secretId}&Source=${params.Source}&SourceText=${encodeURIComponent(params.SourceText)}&Target=${params.Target}&Timestamp=${timestamp}&Version=2018-03-21`;
  
  const signStr = crypto.createHmac('sha1', secretKey)
    .update(srcStr)
    .digest('base64');

  const options = {
    hostname: 'tmt.tencentcloudapi.com',
    port: 443,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-TC-Action': 'TextTranslate',
      'X-TC-Timestamp': timestamp.toString(),
      'X-TC-Nonce': nonce,
      'X-TC-Region': 'ap-guangzhou',
      'Authorization': `TC3-HMAC-SHA256 Credential=${secretId}/${timestamp}/tmt/tc3_request, SignedHeaders=content-type;host, Signature=${signStr}`
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.Response && result.Response.TargetText) {
            resolve({ success: true, result: result.Response.TargetText });
          } else {
            resolve({ success: false, error: result.Error?.Message || '翻译失败' });
          }
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(JSON.stringify(params));
    req.end();
  });
}

// 彩云小译
async function translateCaiyun(text, from, to, config) {
  const { token } = config;
  
  if (!token) {
    return { success: false, error: '请先配置彩云小译 API' };
  }

  const transType = from === 'zh' ? 'zh2en' : 'en2zh';
  
  const options = {
    hostname: 'api.inter.caiyuntrans.com',
    port: 443,
    path: '/v1/caiyunapi',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-authorization': `token ${token}`
    }
  };

  const postData = JSON.stringify({
    source: text,
    trans_type: transType,
    request_id: 'demo'
  });

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.target) {
            resolve({ success: true, result: result.target });
          } else {
            resolve({ success: false, error: result.message || '翻译失败' });
          }
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

// DeepL 翻译
async function translateDeepL(text, from, to, config) {
  const { key } = config;
  
  if (!key) {
    return { success: false, error: '请先配置 DeepL API' };
  }

  const sourceLang = from || 'ZH';
  const targetLang = to || 'EN';
  
  const params = new URLSearchParams({
    auth_key: key,
    text: text,
    source_lang: sourceLang,
    target_lang: targetLang
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'api-free.deepl.com',
      port: 443,
      path: '/v2/translate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': params.toString().length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.translations && result.translations.length > 0) {
            resolve({ success: true, result: result.translations.map(t => t.text).join('\n') });
          } else {
            resolve({ success: false, error: '翻译失败' });
          }
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(params.toString());
    req.end();
  });
}

// 通义千问（Qwen）AI 翻译
async function translateQwen(text, from, to, config) {
  const { apiKey } = config;
  
  if (!apiKey) {
    return { success: false, error: '请先配置通义千问 API Key' };
  }

  // 构建翻译提示词
  const prompt = `Translate the following text from ${from || 'Chinese'} to ${to || 'English'}, only output the translation result:\n\n${text}`;

  const postData = JSON.stringify({
    model: 'qwen-turbo',
    input: {
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    },
    parameters: {
      temperature: 0.1,
      max_tokens: 2000
    }
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'dashscope.aliyuncs.com',
      port: 443,
      path: '/api/v1/services/aigc/text-generation/generation',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.output && result.output.choices && result.output.choices[0]) {
            const translation = result.output.choices[0].message.content.trim();
            resolve({ success: true, result: translation });
          } else {
            resolve({ success: false, error: result.message || '翻译失败' });
          }
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

// 文心一言（Ernie）AI 翻译
async function translateErnie(text, from, to, config) {
  const { apiKey } = config;
  
  if (!apiKey) {
    return { success: false, error: '请先配置文心一言 API Key' };
  }

  // 构建翻译提示词
  const prompt = `将以下文本从${from || '中文'}翻译成${to || '英文'}，只输出翻译结果，不要其他内容：\n\n${text}`;

  const postData = JSON.stringify({
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.1,
    top_p: 0.8,
    penalty_score: 1,
    max_output_tokens: 2000
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'aip.baidubce.com',
      port: 443,
      path: `/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.result) {
            resolve({ success: true, result: result.result.trim() });
          } else {
            resolve({ success: false, error: result.error_msg || '翻译失败' });
          }
        } catch (error) {
          resolve({ success: false, error: error.message });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ success: false, error: error.message });
    });

    req.write(postData);
    req.end();
  });
}
