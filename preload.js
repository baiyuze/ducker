// const startProxyService = require('./spy-debugger/src/index')
// const eventEmit = require()

// // 创建系统代理
// startProxyService((port, debugPort, anyPort) => {
//        /* 创建一个事件对象，名字为newEvent，类型为build */
//       var newEvent = new CustomEvent('PORT_REDIY', { detail: {
//         debugPort,
//         anyPort
//       },bubbles:true,cancelable:true,composed:true });
      
//       /* 给这个事件对象创建一个属性并赋值，这里绑定的事件要和我们创建的事件类型相同，不然无法触发 */
      

         
//      /* 触发自定义事件 */
//      document.dispatchEvent(newEvent); 
// })

  window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
 
  })

