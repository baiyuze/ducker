const startProxyService = require('./spy-debugger/src/index')
// const eventEmit = require()

startProxyService((port) => {
  // 创建iframe标签
  const iframe = document.createElement('iframe');
  iframe.src = `http://127.0.0.1:${port}`;
  iframe.style.boder = 0;
  iframe.width = '100%';
  iframe.height = '100%';
  const content = document.querySelector('#iframe-content');
  iframe.setAttribute('frameborder', 0)
  content.appendChild(iframe)
  iframe.onload = () => {
    const load = document.querySelector('.loadding')
    console.log(load,'load')
    load.style.display = 'none'
  }

})

  window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
 
  })

