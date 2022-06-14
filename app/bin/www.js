
/**
 * 启动系统代理 需要单独进程
 */
const { app } = require('electron')
const cluster = require('cluster')
const { openSystemProxy, closeSystemProxy } = require('../system-proxy')
const { exec } = require("child_process");
const { PROXY_WORKER, SYSTEM_PROT } = require('../../config')
const path = require('path')
const log = require('electron-log');
const { kill } = require('cross-port-killer');

class SystemProxy {
  constructor(mainWindow, Main) {
    this.workMap = {
      [PROXY_WORKER]: null
    }
    this.Main = Main;
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
              log.info(`error: ${error.message}`);
              return;
          }
          if (stderr) {
              log.info(`stderr: ${stderr}`);
              return;
          }
          // 系统代理已关闭==
          log.info(`stdout: ${stdout}`);
      });
      app.exit();
    })
    app.on('before-quit',async (event) => {
      event.preventDefault();
      try {
        this.Main.renderPid && process.kill(this.Main.renderPid, 'SIGHUP');
        await kill(SYSTEM_PROT);
        await closeSystemProxy();
      } catch (error) {
        log.info(error,'ERROR')
      }
      app.exit();
    })
  }
}

module.exports = SystemProxy;