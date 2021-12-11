const { closeSystemProxy } = require('../system-proxy')
 
async function close() {
 closeSystemProxy()
}

close()