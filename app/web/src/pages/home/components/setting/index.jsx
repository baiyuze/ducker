import React, { Component } from 'react'
import { Button, Spin, message } from 'antd';
const { ipcRenderer, config, RenderListener } = window.electron
import './index.less';

export class Setting extends Component {
  constructor() {
    super()
    this.state = {
      loading: false,
      loadingNet: false
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

  render() {
    const { loading, loadingNet } = this.state;
    return (
      <div className='setting-content'>
        <div>
          <Button loading={loading} onClick={this.onClickInstallCrt.bind(this)}>点击安装https证书</Button>
        </div>
        <div style={{ marginTop: 20}}>
          <Button loading={loadingNet} onClick={this.onClickInstallNetCert.bind(this)}>点击处理网络请求弹窗连接请求</Button>
        </div>
      </div>
    )
  }
}

export default Setting
