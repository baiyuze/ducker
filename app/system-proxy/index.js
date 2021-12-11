const osProxy = require('cross-os-proxy')
const { SYSTEM_PROT, SYSTEM_PROXY_START, SYSTEM_PROXY_CLOSE} = require('../../config')


async function openSystemProxy(mainWindow, port = SYSTEM_PROT) {
  await osProxy.setProxy('127.0.0.1', port) // set http and https proxy
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send(SYSTEM_PROXY_START, '系统代理已启动')
  })
}

async function closeSystemProxy() {
  await osProxy.closeProxy() // close http and https proxy
  console.log('系统代理已关闭')
}

module.exports = {
  openSystemProxy,
  closeSystemProxy
}