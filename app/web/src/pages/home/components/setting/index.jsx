import React, { Component } from 'react'
import { Button, Spin, message, Switch} from 'antd';
import './index.less';
const { ipcRenderer, config, RenderListener } = window.electron
const agent = navigator.userAgent.toLowerCase();
const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
export class Setting extends Component {
  constructor() {
    super()
    this.state = {
      loading: false,
      loadingNet: false,
      checked: true
    }
  }

  onClickInstallCrt() {
    this.setState({ loading: true });
    ipcRenderer.send(config.SYSTEM_CLICK_BTN, 'ping')
    document.addEventListener(config.CRT_INSTALL_SUCCESS, (event) => {
      message.success("证书安装成功");
      this.setState({ loading: false })
    }, false)
  }

  onClickInstallNetCert() {
    this.setState({ loadingnNet: true });
    ipcRenderer.send(config.SYSTEM_CLICK_NET_BTN, 'ping')
    document.addEventListener(config.SYSTEM_CLICK_NET_BTN_SUCCESS, (event) => {
      message.success("处理成功");
      this.setState({ loadingnNet: false })
    }, false)
  }

  onOpenInstall() {
    window.open('https://zhuanlan.zhihu.com/p/100719798', '_blank', {
      width: 1000,
      height: 800
    })
  }

  onChangeSwitch() {

  }

  render() {
    const { loading, loadingNet, checked } = this.state;
    return (
      <div className='setting-content'>
        <div>
          {
            isMac ? <Button loading={loading} onClick={this.onClickInstallCrt.bind(this)}>点击安装https证书</Button>
            : <Button onClick={this.onOpenInstall.bind(this)}>查看window证书安装教程</Button>
          }
        </div>
        {/* <div style={{ marginTop: 20}}>

          页面调试功能 <Switch checkedChildren="开启" unCheckedChildren="关闭" checked={checked} onChange={this.onChangeSwitch.bind(this)}/>
        </div> */}
      </div>
    )
  }
}

export default Setting
