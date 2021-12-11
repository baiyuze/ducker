

const {ipcRenderer} = require('electron')
const { SYSTEM_PROXY_START, SYSTEM_PROXY_CLOSE } = require('./config')
ipcRenderer.on(SYSTEM_PROXY_START, (event, message) => {
  const myNotification = new Notification('通知', {
    body: message
  })
})

ipcRenderer.on(SYSTEM_PROXY_CLOSE, (event, message) => {
  const myNotification = new Notification('系统通知', {
    body: message
  })
})