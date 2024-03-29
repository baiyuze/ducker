;modjewel.define("weinre/client/RemotePanel", function(require, exports, module) { // Generated by CoffeeScript 1.8.0
var Binding, ClientList, ConnectorList, DT, RemotePanel, TargetList, Weinre,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Binding = require('../common/Binding');

Weinre = require('../common/Weinre');

ConnectorList = require('./ConnectorList');

DT = require('./DOMTemplates');

WebInspector.Panel.prototype.constructor = WebInspector.Panel;

module.exports = RemotePanel = (function(_super) {
  __extends(RemotePanel, _super);

  Object.defineProperty(RemotePanel.prototype, "toolbarItemClass", {
    get: function() {
      return "remote";
    }
  });

  Object.defineProperty(RemotePanel.prototype, "toolbarItemLabel", {
    get: function() {
      return "Remote";
    }
  });

  Object.defineProperty(RemotePanel.prototype, "statusBarItems", {
    get: function() {
      return [];
    }
  });

  Object.defineProperty(RemotePanel.prototype, "defaultFocusedElement", {
    get: function() {
      return this.contentElement;
    }
  });

  function RemotePanel() {
    RemotePanel.__super__.constructor.call(this, "remote");
    this.initialize();
  }

  
  async function getLocalIp() {
    return new Promise((resolve) => {
      fetch('https://ca.c/localipnode')
      .then(response => response.json())
      .then(data => {
        localIP = data.ip;
        resolve(localIP)
      });
    })
    
  }

  RemotePanel.prototype.initialize = async function() {
    
    const localIP = await getLocalIp()
    var div, icon;
    div = DT.DIV();
    div.style.position = "absolute";
    div.style.top = "1em";
    div.style.right = "1em";
    div.style.left = "1em";
    div.style.bottom = "1em";
    div.style.overflow = "auto";
    icon = DT.IMG({
      src: "../images/weinre-icon-128x128.png"
    });
    icon.style.float = "right";
    div.appendChild(icon);
    this.targetList = new TargetList();
    this.clientList = new ClientList();
    div.appendChild(this.targetList.getElement());
    div.appendChild(this.clientList.getElement());
    this.serverProperties = DT.DIV({
      $className: "weinreServerProperties"
    });
    // div.appendChild(DT.H1("Server Properties"));
    div.appendChild(this.serverProperties);
    const d = document.createElement('div')
    
    d.innerHTML = `
      <h1>手机代理配置</h1>
      <div style="font-size:14px;">
        <p style="color:red">MAC系统调试，无需配置代理</p>
        <p style="color:red">windows系统代理配置教程点击<a target='_blank' href="https://jingyan.baidu.com/article/425e69e6a64ee0ff15fc1699.html">这里</a></p>
        <p style="color:red">windows系统根证书，请点击这里<a target='_blank' href="https://ca.c">下载</a></p>
        <p>第一步：手机和PC保持在同一网络下（比如同时连到一个Wi-Fi下）</p>
        <p>第二步：设置手机的HTTP代理，代理IP地址设置为PC的IP地址，端口为(56231)。</p>
        <p>第三步：1、Android设置代理步骤：设置 - WLAN - 长按选中网络 - 修改网络 - 高级 - 代理设置 - 手动
          2、iOS设置代理步骤：设置 - 无线局域网 - 选中网络 - HTTP代理手动
        </p>
        <p>第四步：手机安装证书。注：手机必须先设置完代理后再通过(非微信)手机浏览器访问http://ca.c(地址二维码)安装证书（手机首次调试需要安装证书，已安装了证书的手机无需重复安装)。<a target='_blank' href="https://github.com/wuchangming/spy-debugger/issues/42">https://www.jianshu.com/p/d312ac54c730</a></p>
        <p>第五步：用手机浏览器访问你要调试的页面即可。</p>
        <p>IP地址：${localIP}</p>
        <p>代理端口：56231</p>
        <p>根证书二维码，扫码下载</p>
        <img style="width:200px;height:200px;" src="../../images/qrcode.png">
      </div>
    `
    div.appendChild(d);

    this.element.appendChild(div);
    return this.reset();
  };

  RemotePanel.prototype.addClient = function(client) {
    return this.clientList.add(client);
  };

  RemotePanel.prototype.addTarget = function(target) {
    return this.targetList.add(target);
  };

  RemotePanel.prototype.getTarget = function(channel) {
    return this.targetList.get(channel);
  };

  RemotePanel.prototype.removeClient = function(channel) {
    return this.clientList.remove(channel);
  };

  RemotePanel.prototype.removeTarget = function(channel) {
    return this.targetList.remove(channel);
  };

  RemotePanel.prototype.setCurrentClient = function(channel) {
    return this.clientList.setCurrent(channel);
  };

  RemotePanel.prototype.setCurrentTarget = function(channel) {
    return this.targetList.setCurrent(channel);
  };

  RemotePanel.prototype.setClientState = function(channel, state) {
    return this.clientList.setState(channel, state);
  };

  RemotePanel.prototype.setTargetState = function(channel, state) {
    return this.targetList.setState(channel, state);
  };

  RemotePanel.prototype.getNewestTargetChannel = function(ignoring) {
    return this.targetList.getNewestConnectorChannel(ignoring);
  };

  RemotePanel.prototype.afterInitialConnection = function() {
    return this.clientList.afterInitialConnection();
  };

  RemotePanel.prototype.reset = function() {
    this.clientList.removeAll();
    this.targetList.removeAll();
    Weinre.WeinreClientCommands.getTargets(Binding(this, "cb_getTargets"));
    return Weinre.WeinreClientCommands.getClients(Binding(this, "cb_getClients"));
  };

  RemotePanel.prototype.connectionClosed = function() {
    this.clientList.removeAll();
    return this.targetList.removeAll();
  };

  RemotePanel.prototype.cb_getTargets = function(targets) {
    var newestTargetChannel, target, _i, _len;
    for (_i = 0, _len = targets.length; _i < _len; _i++) {
      target = targets[_i];
      this.addTarget(target);
    }
    if (!Weinre.client.autoConnect()) {
      return;
    }
    newestTargetChannel = this.getNewestTargetChannel();
    if (!newestTargetChannel) {
      return;
    }
    if (!Weinre.messageDispatcher) {
      return;
    }
    return Weinre.WeinreClientCommands.connectTarget(Weinre.messageDispatcher.channel, newestTargetChannel);
  };

  RemotePanel.prototype.cb_getClients = function(clients) {
    var client, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = clients.length; _i < _len; _i++) {
      client = clients[_i];
      _results.push(this.addClient(client));
    }
    return _results;
  };

  RemotePanel.prototype.show = function() {
    return RemotePanel.__super__.show.call(this);
  };

  RemotePanel.prototype.hide = function() {
    return RemotePanel.__super__.hide.call(this);
  };
// 属性
  RemotePanel.prototype.setServerProperties = function(properties) {
    
    // var aVal, finalVal, key, keys, table, val, _i, _j, _len, _len1;
    // table = "<table>";
    // keys = [];
    // for (key in properties) {
    //   keys.push(key);
    // }
    // keys = keys.sort();
    // for (_i = 0, _len = keys.length; _i < _len; _i++) {
    //   key = keys[_i];
    //   val = properties[key];
    //   if (typeof val === "string") {
    //     val = val.escapeHTML();
    //   } else {
    //     finalVal = "";
    //     for (_j = 0, _len1 = val.length; _j < _len1; _j++) {
    //       aVal = val[_j];
    //       finalVal += "<li>" + aVal.escapeHTML();
    //     }
    //     val = "<ul>" + finalVal + "</ul>";
    //   }
    //   table += ("<tr class='weinre-normal-text-size'><td valign='top'>" + (key.escapeHTML()) + ": <td>") + val;
    // }
    // table += "</table>";
    // return this.serverProperties.innerHTML = table;
  };

  return RemotePanel;

})(WebInspector.Panel);

TargetList = (function(_super) {
  __extends(TargetList, _super);

  function TargetList() {
    TargetList.__super__.constructor.call(this, "Targets");
  }

  TargetList.prototype.getListItem = function(target) {
    var item, self, text;
    self = this;
    text = target.hostName + (" [channel: " + target.channel + " id: " + target.id + "]") + " - " + target.url;
    item = DT.LI({
      $connectorChannel: target.channel
    }, text);
    item.addStyleClass("weinre-connector-item");
    item.addStyleClass("target");
    item.addEventListener("click", (function(e) {
      return self.connectToTarget(target.channel, e);
    }), false);
    target.element = item;
    return item;
  };

  TargetList.prototype.connectToTarget = function(targetChannel, event) {
    var target;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    target = this.connectors[targetChannel];
    if (!target) {
      return false;
    }
    if (target.closed) {
      return false;
    }
    Weinre.WeinreClientCommands.connectTarget(Weinre.messageDispatcher.channel, targetChannel);
    return false;
  };

  return TargetList;

})(ConnectorList);

ClientList = (function(_super) {
  __extends(ClientList, _super);

  function ClientList() {
    ClientList.__super__.constructor.call(this, "Clients");
    this.noneItem.innerHTML = "Waiting for connection...";
  }

  ClientList.prototype.afterInitialConnection = function() {
    this.noneItem.innerHTML = "连接已断开，请尝试刷新页面";
    return this.noneItem.addStyleClass("error");
  };

  ClientList.prototype.getListItem = function(client) {
    var item, text;
    text = client.hostName + (" [channel: " + client.channel + " id: " + client.id + "]");
    item = DT.LI({
      $connectorChannel: client.channel
    }, text);
    item.addStyleClass("weinre-connector-item");
    item.addStyleClass("client");
    if (Weinre.messageDispatcher) {
      if (client.channel === Weinre.messageDispatcher.channel) {
        item.addStyleClass("current");
      }
    }
    client.element = item;
    return item;
  };

  return ClientList;

})(ConnectorList);

require("../common/MethodNamer").setNamesForClass(module.exports);

});
