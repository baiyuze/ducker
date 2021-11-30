
const https = require('https');
const http = require('http');
const fs = require('fs');
const forge = require('node-forge');
const net = require('net');
const url = require('url');
const path = require('path');
const httpProxy = require('http-proxy')
const proxyHttp = require('./livepool/proxy')

function startWatchService() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  function connect(req, clientSocket, head) {
    // 连接到源服务器
    const res = new URL(`http://${req.url}`);
    const {port, hostname} = res;
    const serverSocket = net.connect(port || 80, hostname, () => {
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                      'Proxy-agent: Node.js-Proxy\r\n' +
                      '\r\n');
                      
      serverSocket.write(head);
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });
  }

  function request(cReq, response) {
    var u = url.parse(cReq.url);

    var options = {
        hostname: u.hostname, 
        port: u.port || 80,
        path: u.path,       
        method: cReq.method,
        headers: cReq.headers
    };
    const clientRequest = http.request(options, function(requestRes) {
        let data = ''
        response.writeHead(requestRes.statusCode, requestRes.headers);
        requestRes.setEncoding('utf8');
        requestRes.on('data', (chunk) => {
          data += chunk;
        });
        requestRes.on('end', () => {
          console.log('No more data in response.');
          response.write(data + '我艹');
          response.end();
        });
        // requestRes.pipe(response);
    })
    // 
    clientRequest.on('error', function(e) {
      response.end();
    });
    // 将数据写入请求正文,将cReq写入clientRequest中，调起回调函数
    cReq.pipe(clientRequest);
  }
  const options = {
    key: fs.readFileSync(path.join(process.cwd(),'./app/ssl/localhost+8-key.pem')),
    cert: fs.readFileSync(path.join(process.cwd(),'./app/ssl/localhost+8.pem')),
  }

var proxy2Liveapp = new httpProxy.createProxyServer({
  target: {
      host: '127.0.0.1',
      port: 8888
  }
});
  const proxy = https.createServer(options, (req,res) => {
    proxy2Liveapp.web(req,res)
    console.log(req.url,'===')
  });
  function connection(socket) {

  }

  proxy.on('connect', connect);
  // proxy.on('connection', console.log)
  proxy.on('request', request)
  proxy.on('connection', connection)
  // 现在代理正在运行
  proxy.listen(9999, '0.0.0.0',() => {
    console.log("服务已经启动，请访问:https://127.0.0.1:9999")
  });
  // 创建 HTTP 隧道代理
  // proxyHttp.setProxy(6666);

}
startWatchService()
// module.exports = startWatchService