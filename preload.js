const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("openclawDesktop", {
  readConfig: () => ipcRenderer.invoke("config:read"),
  writeConfig: (config) => ipcRenderer.invoke("config:write", config),
  loadDashboard: (config) => ipcRenderer.invoke("dashboard:load", config),
  restartGateway: (config) => ipcRenderer.invoke("gateway:restart", config),
  switchModel: (config, modelId) =>
    ipcRenderer.invoke("model:switch", { config, modelId }),
  chatWithDeepSeek: (payload) => ipcRenderer.invoke("deepseek:chat", payload)
});
