const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  hideWindow: () => ipcRenderer.send('hide-window'),
  openConfigWindow: () => ipcRenderer.send('open-config-window'),
  
  // 配置窗口控制
  closeConfigWindow: () => ipcRenderer.send('close-config-window'),
  minimizeConfigWindow: () => ipcRenderer.send('minimize-config-window'),
  
  // API 配置相关
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  
  // 翻译 API 调用
  translate: (text, from, to, service) => ipcRenderer.invoke('translate', { text, from, to, service }),
});
