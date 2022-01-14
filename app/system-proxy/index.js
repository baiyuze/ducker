const osProxy = require('./cross-os-proxy/index')
const { SYSTEM_PROT, SYSTEM_PROXY_START, SYSTEM_PROXY_CLOSE} = require('../../config')


async function openSystemProxy(mainWindow, port = SYSTEM_PROT) {

  try {
    await osProxy.setProxy('127.0.0.1', port) // set http and https proxy
  } catch (error) {
  }

  mainWindow.webContents.on('did-finish-load', () => {

    mainWindow.webContents.send(SYSTEM_PROXY_START, '系统代理已启动')
  })
}

async function closeSystemProxy() {
  return new Promise(async (resolve,reject) => {
    try {
      await osProxy.closeProxy() // close http and https proxy
      resolve()
    } catch (error) {
      reject(error)
    }
  })

}

module.exports = {
  openSystemProxy,
  closeSystemProxy
}