// import { Fragment } from '@umijs/renderer-react/node_modules/@types/react';
import { Component, Fragment } from 'react';
import { Tabs, Button, Spin, message } from 'antd';
const { TabPane } = Tabs;
const { ipcRenderer, config, RenderListener } = window.electron
import './index.less';
export default class Home extends Component {
  constructor() {
    super()
    this.state = {
      debuggerSrc: '',
      fidderSrc: '',
      loading: false,
      contentLoading: false
    }
  }
  componentDidMount() {
    this.listenPort()
  }

  async listenPort() {
    this.setState({ contentLoading: true })
    try {
      const { anyPort, debugPort } = await RenderListener('PORT_REDIY')
        const debuggerSrc = `http://127.0.0.1:${debugPort}/client`;
        const fidderSrc = `http://127.0.0.1:${anyPort}`;
        this.setState({ debuggerSrc, fidderSrc})
    } catch (error) {
      console.log(error)
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

  callback(key) {
    console.log(key);
  }

  onLoadIframe() {
    this.setState({ contentLoading: false })
  }

  render() {
    const { debuggerSrc, fidderSrc, loading, contentLoading} = this.state;
    return (
      <Fragment>
        <div className="container-home">
          <Spin tip="Loading..." spinning={contentLoading}>
            <Tabs onChange={this.callback.bind(this)} type="card">
              <TabPane forceRender={true} tab="页面调试" key="1">
                <iframe onLoad={this.onLoadIframe.bind(this)} src={debuggerSrc} frameBorder="0" height="100%" width="100%" ></iframe>
              </TabPane>
              <TabPane tab="请求抓包" key="2">
                <iframe src={fidderSrc} frameBorder="0" height="100%" width="100%" ></iframe>
              </TabPane>
              <TabPane tab="设置" key="3">
                <Button loading={loading} onClick={this.onClickInstallCrt.bind(this)}>点击安装https证书</Button>
              </TabPane>
            </Tabs>
          </Spin>
        </div>
      </Fragment>
    )
  }
}
