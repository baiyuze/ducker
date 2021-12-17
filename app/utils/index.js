

function MainSendMsgToRender(mainWindow, KEY, MSG) {
   mainWindow && mainWindow.webContents.send(KEY, MSG)
}

function MainMsgListener(mainWindow, KEY) {
  const { ipcMain } = require('electron')
  return new Promise((resolve, reject) => {
    ipcMain.on(KEY, async (event, msg) => {
      resolve(msg)
    })
  })
}

function RenderSendMsgToMain(KEY, MSG) {
  if(window && window.electron) {
    const { ipcRenderer } = window.electron
    ipcRenderer.send(KEY, MSG)
  } else {
    console.error("错误，环境不支持")
  }

}

function RenderListener(KEY) {
  return new Promise((resolve) => {
    if(window && window.electron) {
      const { ipcRenderer } = window.electron
      ipcRenderer.on(KEY, (event, message) => {
        resolve(message)
      })
    } else {
      console.error("错误，环境不支持")
    } 

  })


}


// function RendererMsgToMsg() {
//   const EventEmitter = require('events');

// }


module.exports = { 
  MainMsgListener,
  MainSendMsgToRender,
  RenderSendMsgToMain,
  RenderListener
}