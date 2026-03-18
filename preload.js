/**
 * Agent Zero Desktop - Preload Script
 * Provides secure bridge between renderer and main process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
 // App info
 getAppVersion: () => ipcRenderer.invoke('get-app-version'),
 
 // External links
 openExternal: (url) => ipcRenderer.invoke('open-external', url),
 
 // Notifications
 showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
 
 // Platform info
 platform: process.platform,
 
 // Window controls (for custom title bar if needed)
 minimize: () => ipcRenderer.send('window-minimize'),
 maximize: () => ipcRenderer.send('window-maximize'),
 close: () => ipcRenderer.send('window-close'),
});

// Log that preload is ready
console.log('Agent Zero Desktop preload script loaded');
