(function() {
  const path = require('path')
  const { ipcRenderer } = require('electron')
  const { SYSTEM_PROXY_START, SYSTEM_PROXY_CLOSE, SYSTEM_TIP_CRT, CRT_INSTALL_SUCCESS } = require('./config')
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


  ipcRenderer.on(SYSTEM_TIP_CRT, (event, message) => {
    const myNotification = new Notification('系统通知', {
      body: message
    })
    const newEvent = new CustomEvent(CRT_INSTALL_SUCCESS, {},{
      bubbles:true,
      cancelable:true,
      composed:true
    });
     /* 触发自定义事件 */
     document.dispatchEvent(newEvent); 
  })
})()