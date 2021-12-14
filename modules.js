
const { ipcRenderer } = require('electron')
window.electron = {
  ipcRenderer,
  config: require('./config')
};