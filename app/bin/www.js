
/**
 * 启动系统代理 需要单独进程
 */
const { app } = require('electron')
const cluster = require('cluster')
const { openSystemProxy, closeSystemProxy } = require('../system-proxy')
const { exec } = require("child_process");
const { PROXY_WORKER } = require('../../config')
const path = require('path')

class SystemProxy {
  constructor(mainWindow, startService) {
    this.workMap = {
      [PROXY_WORKER]: null
    }
    this.mainWindow = mainWindow;
    this.createWorkProcess()
  }

  async createWorkProcess() {
    // 启动系统代理
    openSystemProxy(this.mainWindow);
    app.on('quit',() => {
      const closePath = path.join(__dirname, '../system-proxy/close.js')
      exec(`node ${closePath}`, (error, stdout, stderr) => {
          if (error) {
              console.log(`error: ${error.message}`);
              return;
          }
          if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
          }
          // 系统代理已关闭==
          console.log(`stdout: ${stdout}`);
      });
    })
    app.on('before-quit',async (event) => {
      event.preventDefault();
      try {
        await closeSystemProxy();
      } catch (error) {
        console.log(error)
      }
      app.exit();
    })
  }
}

module.exports = SystemProxy;