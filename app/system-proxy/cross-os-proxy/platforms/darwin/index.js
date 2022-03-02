const { execFile } = require("child_process")
const setSystemProxy = require("./proxyon")
const offNetSystemProxy = require("./proxyoff")
const path = require("path")

/**
 * start http & https proxy
 * @param {string} host host
 * @param {number} port port
 * @returns Promise<string>
 */
function setProxy(host, port) {
  return new Promise(async (resolve, reject) => {
    try {
      await setSystemProxy(host, port)
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * close http & https proxy
 * @returns Promise<string>
 */
function closeProxy() {
  return new Promise(async (resolve, reject) => {
    try {
      await offNetSystemProxy()
      resolve()
    } catch (error) {
      reject(error)
    }
  })
  
}

module.exports = {
  setProxy,
  closeProxy
}
