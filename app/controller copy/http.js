httpProxy = require('http-proxy')

httpProxy.createServer({
  target: {
    host: '0.0.0.0',
    port: 9009
  },
  ssl: {
    key: fs.readFileSync('./localhost+8-key.pem', 'utf8'),
    cert: fs.readFileSync('./localhost+8.pem', 'utf8')
  }
}).listen(8009);

var option = {
  target: target,
  selfHandleResponse : true
};
proxy.on('proxyRes', function (proxyRes, req, res) {
    var body = [];
    proxyRes.on('data', function (chunk) {
        body.push(chunk);
    });
    proxyRes.on('end', function () {
        body = Buffer.concat(body).toString();
        console.log("res from proxied server:", body);
        res.end("my response to cli");
    });
});
proxy.web(req, res, option);