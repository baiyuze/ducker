// import { Fragment } from '@umijs/renderer-react/node_modules/@types/react';
import { Component, Fragment } from 'react';
import { Tabs, Button, Spin, message } from 'antd';
import Setting from './components/setting'
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
    const port = sessionStorage.getItem('port');
    if (port) {
      this.initPort(port)
    } else {
      this.listenPort()
    }

  }

  initPort(port) {
    const parsePort = JSON.parse(port);
    this.setState({ contentLoading: true })
    const debuggerSrc = `http://127.0.0.1:${parsePort.debugPort}/client`;
    const fidderSrc = `http://127.0.0.1:${parsePort.anyPort}`;
    this.setState({ debuggerSrc, fidderSrc })
  }

  async listenPort() {
    this.setState({ contentLoading: true })
    try {
      const { anyPort, debugPort } = await RenderListener('PORT_REDIY')
        sessionStorage.setItem('port', JSON.stringify({ anyPort, debugPort }))
        const debuggerSrc = `http://127.0.0.1:${debugPort}/client`;
        const fidderSrc = `http://127.0.0.1:${anyPort}`;
        this.setState({ debuggerSrc, fidderSrc})
    } catch (error) {
      console.log(error)
    }

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
                <Setting />
              </TabPane>
            </Tabs>
          </Spin>
        </div>
      </Fragment>
    )
  }
}
