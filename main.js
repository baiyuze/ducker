// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const SystemProxy = require('./app/bin/www')
const { ipcMain } = require('electron')
const setCrt = require('./app/system-proxy/set-crt')
const { MainSendMsgToRender, MainMsgListener } = require('./app/utils/index')
const { SYSTEM_TIP_CRT, SYSTEM_CLICK_BTN, CHILD_MSG_TO_MAIN } = require('./config')

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

  async hideProcessWindow(mainWindowChild, mainWindow) {
    const portContent = await MainMsgListener(mainWindowChild, CHILD_MSG_TO_MAIN)
    MainSendMsgToRender(mainWindow, 'PORT_REDIY', portContent)
  }

  createWindow () {
    const isDev = process.env.NODE_ENV === 'dev';
    const mainWindowChild = new BrowserWindow({
      width: 100,
      height: 100,
      show: false,
      webPreferences: {
        contextIsolation:false,
        nodeIntegration: true
      }
    });

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
    this.installCrt(mainWindow);
    this.createSystemProxyConfig();
    mainWindowChild.loadFile('./child.html')
    this.hideProcessWindow(mainWindowChild, mainWindow)

    if(isDev) {
      mainWindow.loadFile('./index.html')
      mainWindow.webContents.openDevTools()
    } else {
      mainWindow.loadFile('./index.html')
    }
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