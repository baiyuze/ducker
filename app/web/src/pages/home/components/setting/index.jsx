import React, { Component } from 'react'
import './index.less';

export class Setting extends Component {
  constructor() {
    super()
    this.state = {
      loading: false
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

  render() {
    return (
      <div className='setting-content'>
        <Button loading={loading} onClick={this.onClickInstallCrt.bind(this)}>点击安装https证书</Button>

      </div>
    )
  }
}

export default Setting
