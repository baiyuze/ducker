const fs = require('fs');
const path = require('path');
const { exec } = require("child_process")
const log = require('electron-log');

const commandDefault = ['An asterisk (*) denotes that a network service is disabled.','Bluetooth PAN','Thunderbolt Bridge', 'Thunderbolt Bridge 2', ''];
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

// 获取本地所有网络名词
// shell.exec('networksetup -getinfo "USB 10/100/1000 LAN 3"', function(code, stdout, stderr) {
//   console.log(code, stdout, stderr, 'code, stdout, stderr')
// })
async function setSystemProxy(host, port) {
  return new Promise(async (resolve, reject) => {
    try {
      const out = await shellAsync('networksetup -listallnetworkservices');
      const networkArr = out.split('\n');
      const deleteArray = [];
      const newNetWorkArr = [];
      networkArr.forEach((netName, index) => {
        if(commandDefault.includes(netName)) {
          deleteArray.push(index)
        }
      })

      deleteArray.forEach(i => {
        networkArr.splice(i, 1)
      })
      // 筛选有网络的网卡
      for(let i = 0; i < networkArr.length; i++) {
        const networkName = networkArr[i];
        const logNet = await shellAsync(`networksetup -getinfo '${networkName}'`);
        if(logNet.includes('Subnet mask:')) {
          newNetWorkArr.push(networkName);
          await setNetProxy(networkName, host, port, i, networkArr.length);
          const userHome = process.env.HOME || process.env.USERPROFILE;
          const filePath = path.resolve(userHome, './node-mitmproxy/netCatch');
          log.info('filePath' + filePath);
          fs.writeFileSync(filePath, JSON.stringify(newNetWorkArr))
        }
      }
      resolve()
    } catch (error) {
      reject(error)
    }
  })
  
}
// 设置网络代理
function setNetProxy(networkName, host, port, i, l) {
  return new Promise(async (resolve, reject) => {
    // 设置网络代理
    try {
      await shellAsync(`networksetup -setautoproxystate '${networkName}' off`);
      await shellAsync(`networksetup -setwebproxy '${networkName}' '${host}' '${port}'`);
      await shellAsync(`networksetup -setsecurewebproxy '${networkName}' '${host}' '${port}'`);
      resolve()
    } catch (error) {
      // --
      reject(error)
    }
  })
    
}
module.exports = setSystemProxy