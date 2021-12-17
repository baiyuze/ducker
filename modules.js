
const { ipcRenderer } = require('electron')
const v = require('./app/utils/index')

window.electron = {
  ipcRenderer,
  config: require('./config'),
  ...v
};