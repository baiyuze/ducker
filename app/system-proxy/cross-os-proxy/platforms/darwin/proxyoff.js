const { exec } = require("child_process");
const { net } = require("electron");
const path = require('path');
const fs = require("fs")
const log = require('electron-log');


function shellAsync(command) {
  return new Promise((resolve, reject) => {
    exec(command, function(err, stdout, stderr) {
      if(!err) {
        resolve(stdout);
      } else {
        reject(stderr);
      }
    })
  })
}

function offNetSystemProxy() {
  return new Promise(async (resolve, reject) => {
    try {
      const userHome = process.env.HOME || process.env.USERPROFILE;
      const filePath = path.resolve(userHome, './node-mitmproxy/netCatch');
      log.info('filePath_off' + filePath);
      const netArr = JSON.parse(fs.readFileSync(filePath, 'utf8')) || []
      log.info('netArr_off' + netArr);
      for(let i = 0; i < netArr.length; i++) {
        const name = netArr[i];
        await setNetProxy(name, i, netArr.length)
      }
      resolve()
    } catch (error) {
      reject(error)
    }
  })


}

// 设置网络代理
async function setNetProxy(networkName, i, length) {
    // 设置网络代理
    try {
      await shellAsync(`networksetup -setwebproxystate '${networkName}' off`);
      await shellAsync(`networksetup -setsecurewebproxystate '${networkName}' off`);
    } catch (error) {
      log.info(error)
    }
}

module.exports = offNetSystemProxy