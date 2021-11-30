const path = require('path');
const forge = require('node-forge');
const pki = forge.pki;
const tls = require('tls');
const url = require('url');
const http = require('http');
const https = require('https');
const fs = require('fs');
const util = require('./util')


const caCertPath = path.join(__dirname, './rootCA/rootCA.crt');
const caKeyPath = path.join(__dirname, './rootCA/rootCA.key.pem');

try {
    fs.accessSync(caCertPath, fs.F_OK);
    fs.accessSync(caKeyPath, fs.F_OK);
} catch (e) {
    console.log(`在路径下：${caCertPath} 未找到CA根证书`, e);
    process.exit(1);
}

fs.readFileSync(caCertPath);
fs.readFileSync(caKeyPath);

const caCertPem = fs.readFileSync(caCertPath);
const caKeyPem = fs.readFileSync(caKeyPath);
const caCert = forge.pki.certificateFromPem(caCertPem);
const caKey = forge.pki.privateKeyFromPem(caKeyPem);
const hostMap = {}
/**
 * 根据CA证书生成一个伪造的https服务
 * @param  {[type]} ca         [description]
 * @param  {[type]} domain     [description]
 * @param  {[type]} successFun [description]
 * @return {[type]}            [description]
 */
function createFakeHttpsWebSite(domain, successFun) {

    const fakeCertObj = createFakeCertificateByDomain(caKey, caCert, domain)
    const customKey = pki.privateKeyToPem(fakeCertObj.key)
    const customCert = pki.certificateToPem(fakeCertObj.cert)
    
    var fakeServer = new https.Server({
        // key: fakeCertObj.key,
        // cert: fakeCertObj.cert,
        // key: customKey,
        // cert: customCert,

        SNICallback: (hostname, done) => {
            let certObj = createFakeCertificateByDomain(caKey, caCert, hostname)
            const certObjStr = {
                key: pki.privateKeyToPem(certObj.key),
                cert: pki.certificateToPem(certObj.cert)
            }
            hostMap[hostname] = certObjStr
            done(null, tls.createSecureContext(certObjStr))
        }
    });

    fakeServer.listen(0, () => {
        var address = fakeServer.address();
        successFun(address.port);
    });
    fakeServer.on('request', function requestHandler(req, res, ) {
      let ssl = true;
      //  let options =  {
      //     protocol: 'https:',
      //     hostname,
      //     method: req.method,
      //     port: req.headers.host.split(':')[1] || 443,
      //     path: urlObject.path,
      //     headers: req.headers
      //   };
        var proxyReq;

        var rOptions = util.getOptionsFormRequest(req, ssl);

        if (rOptions.headers.connection === 'close') {
            req.socket.setKeepAlive(false);
        } else if (rOptions.customSocketId != null) {  // for NTLM
            req.socket.setKeepAlive(true, 60 * 60 * 1000);
        } else {
            req.socket.setKeepAlive(true, 30000);
        }

        console.log(rOptions,'rOptions')
        var requestInterceptorPromise = () => {
            return new Promise((resolve, reject) => {
                var next = () => {
                    resolve();
                }
                try {
                    // if (typeof requestInterceptor === 'function') {
                        // requestInterceptor.call(null, rOptions, req, res, ssl, next);
                    // } else {
                        resolve();
                    // }
                } catch (e) {
                    reject(e);
                }
            });
        }

        var proxyRequestPromise = () => {
            return new Promise((resolve, reject) => {

                rOptions.host = rOptions.hostname || rOptions.host || 'localhost';

                // use the binded socket for NTLM
                if (rOptions.agent && rOptions.customSocketId != null && rOptions.agent.getName) {
                    var socketName = rOptions.agent.getName(rOptions)
                    var bindingSocket = rOptions.agent.sockets[socketName]
                    if (bindingSocket && bindingSocket.length > 0) {
                        bindingSocket[0].once('free', onFree)
                        return;
                    }
                }
                onFree()
                function onFree() {
                    proxyReq = (rOptions.protocol == 'https:' ? https: http).request(rOptions, (proxyRes) => {
                        resolve(proxyRes);
                    });
                    proxyReq.on('timeout', () => {
                        reject(`${rOptions.host}:${rOptions.port}, request timeout`);
                    })

                    proxyReq.on('error', (e) => {
                        reject(e);
                    })

                    proxyReq.on('aborted', () => {
                        reject('server aborted reqest');
                        req.abort();
                    })

                    req.on('aborted', function () {
                        proxyReq.abort();
                    });
                    req.pipe(proxyReq);

                }

            });
        }

        // workflow control
        (async () => {

            await requestInterceptorPromise();

            if (res.finished) {
                return false;
            }

            var proxyRes = await proxyRequestPromise();


            var responseInterceptorPromise = new Promise((resolve, reject) => {
                var next = () => {
                    resolve();
                }
                try {
                    // if (typeof responseInterceptor === 'function') {
                    //     responseInterceptor.call(null, req, res, proxyReq, proxyRes, ssl, next);
                    // } else {
                        resolve();
                    // }
                } catch (e) {
                    reject(e);
                }
            });

            await responseInterceptorPromise;

            if (res.finished) {
                return false;
            }

            try {
                if (!res.headersSent){  // prevent duplicate set headers
                    Object.keys(proxyRes.headers).forEach(function(key) {
                        if(proxyRes.headers[key] != undefined){
                            // https://github.com/nodejitsu/node-http-proxy/issues/362
                            if (/^www-authenticate$/i.test(key)) {
                                if (proxyRes.headers[key]) {
                                    proxyRes.headers[key] = proxyRes.headers[key] && proxyRes.headers[key].split(',');
                                }
                                key = 'www-authenticate';
                            }
                            res.setHeader(key, proxyRes.headers[key]);
                        }
                    });

                    res.writeHead(proxyRes.statusCode);
                    console.log('111111111111111')
                    proxyRes.pipe(res);
                }
            } catch (e) {
                throw e;
            }
        })().then(
            (flag) => {
                // do nothing
            },
            (e) => {
                if (!res.finished) {
                    res.writeHead (500);
                    res.write(`Node-MitmProxy Warning:\n\n ${e.toString()}`);
                    res.end();
                }
                console.error(e);
            }
        );

    })
    // (req, res) => {
    //     const hostname = req.headers.host.split(':')[0]
    //     const protocol = 'https:';
    //     // 解析客户端请求
    //     var urlObject = url.parse(req.url);
    //     let options =  {
    //         protocol: 'https:',
    //         hostname,
    //         method: req.method,
    //         port: req.headers.host.split(':')[1] || 443,
    //         path: urlObject.path,
    //         headers: req.headers,
    //         // key: hostMap[hostname].key,
    //         // cert: hostMap[hostname].cert
    //         // key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
    //         // cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
    //     };
    //     // https请求

    //     // const options1 = {
    //     //     protocol: 'https:',
    //     //     hostname: hostname,
    //     //     port: 443,
    //     //     path: urlObject.path,
		// 		// 		method: req.method,
    //     //     headers: req.headers,
		// 		// 		agent: false
    //     //   };
          
    //     //   const req1 = https.request(options, (res1) => {
    //     //   //   console.log('statusCode:', res.statusCode);
    //     //   //   console.log('headers:', res.headers);
    //     //       let a = ''
    //     //     res1.on('data', (d) => {
    //     //         a += d;
    //     //     });
    //     //     res1.on('end', (e) => {
    //     //       console.log(a);
		// 		// 			res.writeHead(res1.statusCode, 'content-type: utf8');
    //     //       res.write(a)
    //     //       res.end();
    //     //     });
    //     //   });
    //     // req.pipe(req1);
    //     res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8'});
    //     res.write(`<html><body>我是伪造的: ${options.protocol}//${options.hostname} 站点</body></html>`)
    //     res.end();
    //     // var urllib = require('urllib');
		// 		// const reqUrl = protocol+'//'+options.hostname + req.url;
    //     // if(req.headers.accept && req.headers.accept.includes('image')) {
    //     //   res.write(null)
		// 		// 	res.end();
    //     // } else {
    //     //   urllib.request(reqUrl, options,function (err, data, requestRes) {
    //     //     if(err) {
    //     //       console.log(err,'====')
    //     //     }
    //     //     res.writeHead(requestRes.statusCode);
    //     //     res.write(data)
    //     //     res.end();
    //     //   });
    //     // }
		// 		// console.log(req.data,'====')

    //     // const clientReq = https.request(options, function(requestRes) { 
    //     //     let data = '';
    //     //     requestRes.on('data', (chunk) => {
    //     //         data += chunk;
    //     //     });
    //     //     requestRes.on('end', () => {
    //     //         console.log(data,'====options=====')

    //     //     });
    //     // })
    //     // clientReq.on('error', (e) => {
    //     //     console.error(e);
    //     // });
    //     // clientReq.end();
    //     // req.pipe(clientReq);
    // });

    fakeServer.on('error', (e) => {
        console.error(e);
    });

}

/**
 * 根据所给域名生成对应证书
 * @param  {[type]} caKey  [description]
 * @param  {[type]} caCert [description]
 * @param  {[type]} domain [description]
 * @return {[type]}        [description]
 */
function createFakeCertificateByDomain(caKey, caCert, domain) {
    var keys = pki.rsa.generateKeyPair(4096);
    var cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;

    cert.serialNumber = (new Date()).getTime()+'';
    cert.validity.notBefore = new Date();
    cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 1);
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);
    var attrs = [{
      name: 'commonName',
      value: domain
    }, {
      name: 'countryName',
      value: 'CN'
    }, {
      shortName: 'ST',
      value: 'GuangDong'
    }, {
      name: 'localityName',
      value: 'ShengZhen'
    }, {
      name: 'organizationName',
      value: 'https-my-cert'
    }, {
      shortName: 'OU',
      value: 'https://github.com/wuchangming/https-my-cert'
    }];

    cert.setIssuer(caCert.subject.attributes);
    cert.setSubject(attrs);

    cert.setExtensions([{
        name: 'basicConstraints',
        critical: true,
        cA: false
    },
    {
        name: 'keyUsage',
        critical: true,
        digitalSignature: true,
        contentCommitment: true,
        keyEncipherment: true,
        dataEncipherment: true,
        keyAgreement: true,
        keyCertSign: true,
        cRLSign: true,
        encipherOnly: true,
        decipherOnly: true
    },
    {
        name: 'subjectAltName',
        altNames: [{
          type: 2,
          value: domain
        }]
    },
    {
        name: 'subjectKeyIdentifier'
    },
    {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        emailProtection: true,
        timeStamping: true
    },
    {
        name:'authorityKeyIdentifier'
    }]);
    cert.sign(caKey, forge.md.sha256.create());

    return {
        key: keys.privateKey,
        cert: cert
    };
}

module.exports = createFakeHttpsWebSite