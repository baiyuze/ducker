// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const SystemProxy = require('./app/bin/www')
const { ipcMain } = require('electron')
const setCrt = require('./app/system-proxy/set-crt')
const installCrt = require('./app/system-proxy/set-crt/install')
const { MainSendMsgToRender, MainMsgListener } = require('./app/utils/index')
const env = require('./config/env.json');
const { SYSTEM_TIP_CRT, 
  SYSTEM_CLICK_BTN, 
  CHILD_MSG_TO_MAIN, 
  SYSTEM_CLICK_NET_BTN_SUCCESS,
  SYSTEM_CLICK_NET_BTN } = require('./config')

const isDev = env.NODE_ENV === 'development';
class CreateProxyServerAndInitUI {
  // SystemProxy
  constructor() {
    this.mainWindow = null;
    this.pid = null;
    this.initWinidow();
  }

  installCrt(mainWindow) {
    ipcMain.on(SYSTEM_CLICK_BTN, async (event, arg) => {
      let msg = null;
      try {
        // 设置证书
        await setCrt()
        msg = '证书安装完成';
      } catch (error) {
        msg = '证书安装失败，请手动安装证书';
      }
      mainWindow.webContents.send(SYSTEM_TIP_CRT, msg)
    })

    ipcMain.on(SYSTEM_CLICK_NET_BTN, async (event, arg) => {
      let msg = '测试1下';
      await installCrt();
      // try {
      //   // 设置证书
      //   await setCrt()
      //   msg = '证书安装完成';
      // } catch (error) {
      //   msg = '证书安装失败，请手动安装证书';
      // }
      mainWindow.webContents.send(SYSTEM_CLICK_NET_BTN_SUCCESS, msg)
    })

    
  }
  
  initWinidow() {
    this.readyServer();
  }

  async createSystemProxyConfig(mainWindow) {
    new SystemProxy(mainWindow)
  }

  async hideProcessWindow(mainWindowChild, mainWindow) {
    const portContent = await MainMsgListener(mainWindowChild, CHILD_MSG_TO_MAIN);
    this.pid = portContent.pid;
    MainSendMsgToRender(mainWindow, 'PORT_REDIY', portContent);
  }

  createWindow (type) {
    const mainWindowChild = new BrowserWindow({
      width: 800,
      height: 800,
      show: true,
      webPreferences: {
        contextIsolation:false,
        nodeIntegration: true
      }
    });
    const mainWindow = new BrowserWindow({
      width: 1000,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation:false,
        nodeIntegration: true
      }
    });

    const html = isDev ? 'index-prod.html' : 'index-prod.html';
    this.onEventChange(mainWindow)
    mainWindow.loadFile(html);
    mainWindowChild.loadFile('./child.html');
    this.mainWindow = mainWindow;

    this.installCrt(mainWindow);
    this.createSystemProxyConfig(mainWindow);
    this.hideProcessWindow(mainWindowChild, mainWindow);
  }

  onEventChange(mainWindow) {
    // 不会更改标题
    mainWindow.on('page-title-updated', (event) => {
      event.preventDefault();
    });
    mainWindow.on('close', (event) => {
      event.preventDefault();
      app.quit();
    });
  }

  readyServer() {
    app && app.whenReady().then(() => {
      if (BrowserWindow.getAllWindows().length === 0) this.createWindow()
    })
    app && app.on('window-all-closed', () => {
      app.quit()
    })
  }
}

new CreateProxyServerAndInitUI()