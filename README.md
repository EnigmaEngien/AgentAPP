# Agent Zero Desktop

A native desktop application wrapper for the [Agent Zero](https://github.com/agent0ai/agent-zero) AI agent framework.

## Technology Stack

| Component | Technology | Reason |
|-----------|------------|--------|
| Framework | **Electron** | Mature, cross-platform, excellent web wrapper |
| Main Process | Node.js | Native system integration |
| UI | Agent Zero Web UI | Existing responsive interface |

**Why Electron?**
- Battle-tested (VS Code, Slack, Discord use it)
- Excellent for wrapping web applications
- Strong ecosystem and tooling
- Cross-platform support (Windows, macOS, Linux)
- System tray, notifications, native menus built-in

## Features

- 🚀 **Native Desktop Experience** - Runs Agent Zero in a native window
- 🔔 **System Tray** - Minimize to tray, quick access menu
- 📱 **Desktop Notifications** - Get notified when agent completes tasks
- 🖥️ **Window Management** - Minimize, maximize, always-on-top
- 🔄 **Server Management** - Restart Agent Zero from tray/menu
- 🌐 **External Links** - Open links in default browser
- 📋 **Standard Shortcuts** - Copy, paste, undo, redo, etc.

## Installation

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- Agent Zero framework (at `/a0`)

### Install Dependencies

```bash
cd desktop_app
npm install
```

## Usage

### Development Mode

```bash
npm start
```

This will:
1. Start the Agent Zero web server
2. Launch the Electron desktop window
3. Load the Agent Zero interface

### Build Distributable

```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build:win   # Windows
npm run build:mac   # macOS
npm run build:linux # Linux
```

The built application will be in the `dist/` folder.

## Configuration

### Port Configuration

The desktop app reads the port from Agent Zero's `.env` file:

```bash
# In /a0/.env
WEB_UI_PORT=5000
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `WEB_UI_PORT` | Port for Agent Zero web UI | 5000 |

## Project Structure

```
desktop_app/
├── main.js          # Electron main process
├── preload.js       # Secure bridge between processes
├── package.json     # NPM dependencies and scripts
├── assets/          # Icons and other assets
└── dist/            # Built application (after build)
```

## Comparison: Desktop App Technologies

| Technology | Size | Memory | Best For |
|------------|------|--------|----------|
| **Electron** | ~150MB | High | Web app wrapping, feature-rich apps |
| **Tauri** | ~10MB | Low | Lightweight, security-focused |
| **Pyloid** | ~150MB | Medium | Python-centric development |
| **PyQt** | ~50MB | Medium | Native look, Python apps |

We chose **Electron** because:
1. Agent Zero already has a mature web UI
2. Excellent dev tools and ecosystem
3. Easy to add system tray, notifications
4. Proven at scale (VS Code, Slack, etc.)

## License

MIT License - see [LICENSE](../../LICENSE)
