
(function() {
  const { ipcRenderer } = require('electron')
  const { SYSTEM_CLICK_BTN } = require('./config')
  var weinreBtn = document.getElementById('weinreBtn');
  var anyProxyBtn = document.getElementById('anyProxyBtn');
  var weinreIframe = document.getElementById('weinreIframe');
  var anyProxyIframe = document.getElementById('anyProxyIframe');
  var loadding = document.getElementById('loadding');
  var deProxy = document.getElementById('deProxy');
  var anyProxy = document.getElementById('anyProxy');
  var settingcontent = document.getElementById('settingcontent');
  var setting = document.getElementById('setting');
    var btnCrt = document.querySelector('.btn-crt')
      /* 将自定义事件绑定在document对象上 */
  document.addEventListener("PORT_REDIY",function(event){
      const { anyPort, debugPort } = event.detail;
      deProxy.src = `http://127.0.0.1:${debugPort}/client`;
      anyProxy.src = `http://127.0.0.1:${anyPort}`;
  },false)
  deProxy.onload = () => {
    loadding.style.display = 'none'
  }

  setting.onclick=function(){
  weinreIframe.style.display = 'none';
  anyProxyIframe.style.display = 'none';
  settingcontent.style.display = 'block';
  weinreBtn.className = 'active';
  anyProxyBtn.className = "";
  setting.className = "active";
  }

  weinreBtn.onclick=function(){
    weinreIframe.style.display = 'block';
    anyProxyIframe.style.display = 'none';
    settingcontent.style.display = 'none';
    weinreBtn.className = 'active';
    anyProxyBtn.className = "";
    setting.className = "";
  }

  anyProxyBtn.onclick=function(){
    weinreIframe.style.display = 'none';
    anyProxyIframe.style.display = 'block';
    settingcontent.style.display = 'none';
    weinreBtn.className = '';
    anyProxyBtn.className = "active";
    setting.className = "";

  }
  btnCrt.onclick=function() {
    console.log(SYSTEM_CLICK_BTN,'SYSTEM_CLICK_BTN')
    ipcRenderer.send(SYSTEM_CLICK_BTN, 'ping')
  }

})()