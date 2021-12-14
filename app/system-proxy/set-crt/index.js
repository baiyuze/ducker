
const { exec } = require("child_process");
const path = require('path');
const sudo = require('sudo-prompt');

function setCrt() {
  return new Promise((resolve, reject) => {
    const crtPath = path.join(process.cwd(),'./config/node-mitmproxy.ca.crt')
    switch (process.platform.toLowerCase()) {
      case 'darwin':
        const options = {
        name: 'ducker',
      };
      sudo.exec('security authorizationdb write com.apple.trust-settings.admin allow', options,
        function(error, stdout, stderr) {
          if (error) throw error;
          exec(`osascript -e 'do shell script "security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ~/node-mitmproxy/node-mitmproxy.ca.crt" with prompt "将APP自签名证书安装到钥匙串中" with administrator privileges'`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject()
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            resolve()
          })
        }
      );
      break;
      case 'win32':
        exec(shellStr, (error, stdout, stderr) => {
          if (error) {
              console.log(`error: ${error.message}`);
              reject()
              return;
          }
          if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
          }
          resolve()
          console.log(`stdout: ${stdout}`);
        })
      break;
      default:
        break;
    }
  })
  
  
}

module.exports = setCrt;