// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const SystemProxy = require('./app/bin/www')


class CreateProxyServerAndInitUI {
  // SystemProxy
  constructor() {
    this.mainWindow = null;
    this.initWinidow();
  }
  
  initWinidow() {
    this.readyServer();
  }

  async createSystemProxyConfig() {
    new SystemProxy(this.mainWindow)
  }

  createWindow () {
    const mainWindow = new BrowserWindow({
      width: 1400,
      height: 1000,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation:false,
        nodeIntegration: true
      }
    })
    this.mainWindow = mainWindow;
    this.createSystemProxyConfig()
    mainWindow.loadFile('./index.html')
    process.env.NODE_ENV === 'dev' ? mainWindow.webContents.openDevTools() : null
  }

  readyServer() {
    app && app.whenReady().then(() => {
      if (BrowserWindow.getAllWindows().length === 0) this.createWindow()
      app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) this.createWindow()
      })
    })

    app && app.on('window-all-closed', function () {
      if (process.platform !== 'darwin') app.quit()
    })
  }
}

new CreateProxyServerAndInitUI()