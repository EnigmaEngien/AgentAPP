/**
 * Agent Zero Desktop Application
 * Electron main process - wraps the Agent Zero web interface
 * 
 * Technology: Electron (mature, cross-platform desktop framework)
 */

const { app, BrowserWindow, Menu, Tray, ipcMain, dialog, shell, nativeImage } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

// Configuration
const A0_PATH = '/a0';
const DEFAULT_PORT = 5000;
const WINDOW_WIDTH = 1400;
const WINDOW_HEIGHT = 900;

// Global references
let mainWindow = null;
let tray = null;
let a0Process = null;
let serverPort = DEFAULT_PORT;

// Get port from environment
function getA0Port() {
 try {
 const envPath = path.join(A0_PATH, '.env');
 if (fs.existsSync(envPath)) {
 const content = fs.readFileSync(envPath, 'utf8');
 const match = content.match(/WEB_UI_PORT=(\d+)/);
 if (match) {
 return parseInt(match[1]);
 }
 }
 } catch (e) {
 console.log('Could not read .env file, using default port');
 }
 return DEFAULT_PORT;
}

// Start Agent Zero server
function startAgentZero() {
 console.log('Starting Agent Zero server...');
 
 // Set environment variables
 const env = { ...process.env };
 env.PYTHONUNBUFFERED = '1';
 
 // Run Agent Zero's run_ui.py
 a0Process = spawn('python3', ['run_ui.py'], {
 cwd: A0_PATH,
 env: env,
 stdio: ['ignore', 'pipe', 'pipe']
 });
 
 a0Process.stdout.on('data', (data) => {
 console.log(`Agent Zero: ${data}`);
 });
 
 a0Process.stderr.on('data', (data) => {
 console.error(`Agent Zero Error: ${data}`);
 });
 
 a0Process.on('close', (code) => {
 console.log(`Agent Zero process exited with code ${code}`);
 });
 
 // Wait for server to start
 return new Promise((resolve) => {
 let attempts = 0;
 const maxAttempts = 30;
 
 const checkServer = () => {
 attempts++;
 const net = require('net');
 const client = new net.Socket();
 
 client.connect(serverPort, '127.0.0.1', () => {
 client.destroy();
 console.log(`Agent Zero server is ready on port ${serverPort}`);
 resolve(true);
 });
 
 client.on('error', () => {
 client.destroy();
 if (attempts < maxAttempts) {
 setTimeout(checkServer, 1000);
 } else {
 console.log('Warning: Server may not be ready');
 resolve(false);
 }
 });
 };
 
 setTimeout(checkServer, 2000);
 });
}

// Create main window
function createWindow() {
 mainWindow = new BrowserWindow({
 width: WINDOW_WIDTH,
 height: WINDOW_HEIGHT,
 minWidth: 800,
 minHeight: 600,
 title: 'Agent Zero',
 icon: path.join(__dirname, 'assets', 'icon.png'),
 webPreferences: {
 preload: path.join(__dirname, 'preload.js'),
 contextIsolation: true,
 nodeIntegration: false,
 sandbox: false
 },
 show: false,
 autoHideMenuBar: false
 });
 
 // Load Agent Zero URL
 const url = `http://127.0.0.1:${serverPort}`;
 console.log(`Loading ${url}...`);
 mainWindow.loadURL(url);
 
 // Show window when ready
 mainWindow.once('ready-to-show', () => {
 mainWindow.show();
 console.log('Window ready and shown');
 });
 
 // Handle window close - minimize to tray instead
 mainWindow.on('close', (event) => {
 if (!app.isQuitting) {
 event.preventDefault();
 mainWindow.hide();
 }
 });
 
 mainWindow.on('closed', () => {
 mainWindow = null;
 });
 
 // Open DevTools in development
 if (process.argv.includes('--dev')) {
 mainWindow.webContents.openDevTools();
 }
}

// Create system tray
function createTray() {
 // Create a simple tray icon (16x16 base64 PNG)
 const iconData = nativeImage.createFromDataURL(
 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8aLcQwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADlSURBVDiNpZMxDoJAEEXfLhZW和行为xI6GxoqOjo6KTsQDuAJXoOAKdDQ0dHR0dHQhvo0Fi8WyYJbdzUzm7///z+wCMlKKf4D4A2aADWgDN2AKXIELsAYS4Ay8gQswBMqr8gKMgD4wAJaq8gQ0gB5QXVUmYA4MgcWqPANNIAeKVdkDJsAYWKvKBMiAJjAEyqvcD9gD5VV5ANpADhRW5X5gBNSq8gC0gRxIVOUeyIESKK3KOVAChVW5B/KgsCoPQBvIgcKq3AM5UFqVe6AAyqtyB+RAoSr3QAH8AB9xU9MKE9QnAAAAAElFTkSuQmCC'
 );
 
 tray = new Tray(iconData);
 
 const contextMenu = Menu.buildFromTemplate([
 {
 label: 'Show Agent Zero',
 click: () => {
 if (mainWindow) {
 mainWindow.show();
 mainWindow.focus();
 }
 }
 },
 {
 label: 'Hide',
 click: () => {
 if (mainWindow) {
 mainWindow.hide();
 }
 }
 },
 { type: 'separator' },
 {
 label: 'Restart Server',
 click: () => {
 if (a0Process) {
 a0Process.kill();
 }
 startAgentZero();
 }
 },
 { type: 'separator' },
 {
 label: 'Quit',
 click: () => {
 app.isQuitting = true;
 if (a0Process) {
 a0Process.kill();
 }
 app.quit();
 }
 }
 ]);
 
 tray.setToolTip('Agent Zero Desktop');
 tray.setContextMenu(contextMenu);
 
 tray.on('double-click', () => {
 if (mainWindow) {
 mainWindow.show();
 mainWindow.focus();
 }
 });
}

// Create application menu
function createMenu() {
 const template = [
 {
 label: 'File',
 submenu: [
 {
 label: 'Restart Agent Zero',
 click: () => {
 if (a0Process) {
 a0Process.kill();
 }
 startAgentZero();
 }
 },
 { type: 'separator' },
 {
 label: 'Quit',
 accelerator: 'CmdOrCtrl+Q',
 click: () => {
 app.isQuitting = true;
 if (a0Process) {
 a0Process.kill();
 }
 app.quit();
 }
 }
 ]
 },
 {
 label: 'Edit',
 submenu: [
 { role: 'undo' },
 { role: 'redo' },
 { type: 'separator' },
 { role: 'cut' },
 { role: 'copy' },
 { role: 'paste' },
 { role: 'selectAll' }
 ]
 },
 {
 label: 'View',
 submenu: [
 { role: 'reload' },
 { role: 'forceReload' },
 { role: 'toggleDevTools' },
 { type: 'separator' },
 { role: 'resetZoom' },
 { role: 'zoomIn' },
 { role: 'zoomOut' },
 { type: 'separator' },
 { role: 'togglefullscreen' }
 ]
 },
 {
 label: 'Window',
 submenu: [
 { role: 'minimize' },
 { role: 'zoom' },
 { type: 'separator' },
 {
 label: 'Always on Top',
 type: 'checkbox',
 checked: false,
 click: (menuItem) => {
 if (mainWindow) {
 mainWindow.setAlwaysOnTop(menuItem.checked);
 }
 }
 },
 { type: 'separator' },
 { role: 'close' }
 ]
 },
 {
 label: 'Help',
 submenu: [
 {
 label: 'About Agent Zero',
 click: () => {
 dialog.showMessageBox(mainWindow, {
 type: 'info',
 title: 'About Agent Zero',
 message: 'Agent Zero Desktop',
 detail: 'Version 1.0.0\n\nA native desktop wrapper for the Agent Zero AI agent framework.\n\nBuilt with Electron.'
 });
 }
 },
 {
 label: 'Open Agent Zero Website',
 click: () => {
 shell.openExternal('https://agent-zero.ai');
 }
 }
 ]
 }
 ];
 
 const menu = Menu.buildFromTemplate(template);
 Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(async () => {
 console.log('Agent Zero Desktop starting...');
 
 // Get configuration
 serverPort = getA0Port();
 console.log(`Using port: ${serverPort}`);
 
 // Start Agent Zero server
 await startAgentZero();
 
 // Create window and tray
 createWindow();
 createTray();
 createMenu();
 
 console.log('Agent Zero Desktop ready!');
});

app.on('window-all-closed', () => {
 if (process.platform !== 'darwin') {
 app.quit();
 }
});

app.on('activate', () => {
 if (BrowserWindow.getAllWindows().length === 0) {
 createWindow();
 } else if (mainWindow) {
 mainWindow.show();
 }
});

app.on('before-quit', () => {
 app.isQuitting = true;
 if (a0Process) {
 a0Process.kill();
 }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
 return app.getVersion();
});

ipcMain.handle('open-external', (event, url) => {
 shell.openExternal(url);
});

ipcMain.handle('show-notification', (event, { title, body }) => {
 const { Notification } = require('electron');
 if (Notification.isSupported()) {
 new Notification({ title, body }).show();
 }
});
