// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const SystemProxy = require('./app/bin/www')
const { ipcMain } = require('electron')
const setCrt = require('./app/system-proxy/set-crt')
const { SYSTEM_TIP_CRT, SYSTEM_CLICK_BTN } = require('./config')

class CreateProxyServerAndInitUI {
  // SystemProxy
  constructor() {
    this.mainWindow = null;
    this.initWinidow();
  }

  installCrt(mainWindow) {
    ipcMain.on(SYSTEM_CLICK_BTN, async (event, arg) => {
      let msg = ''
      try {
        // 设置证书
        await setCrt()
        msg = '证书安装完成';
      } catch (error) {
        msg = '证书安装失败，请手动安装证书';
      }
      mainWindow.webContents.send(SYSTEM_TIP_CRT, msg)
    })

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
    this.installCrt(mainWindow)
    this.createSystemProxyConfig()
    mainWindow.loadFile('./wrap.html')
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