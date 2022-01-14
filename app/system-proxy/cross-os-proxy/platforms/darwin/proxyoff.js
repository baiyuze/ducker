const { exec } = require("child_process");
const { net } = require("electron");
const path = require('path');
const fs = require("fs")


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
      const net = JSON.parse(fs.readFileSync(path.join(process.cwd(), './app/system-proxy/cross-os-proxy/platforms/darwin/netCatch'), 'utf8')) || []
      net.forEach(async (name, i) => {
        
      })
      for(let i = 0; i < net.length -1; i++) {
        const name = net[i];
        await setNetProxy(name, i, net.length)
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
      console.log(error)
    }
}

module.exports = offNetSystemProxy