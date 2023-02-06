import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "mobx-react";
import {ConfigProvider} from "antd";
import stores from '@store'
import Router from "./router";
import './index.css';
import 'antd/dist/antd.less'

const App = () => {
  return (
    <ConfigProvider>
      <Provider {...stores}>
        <Router />
      </Provider>
    </ConfigProvider>
  )
}

ReactDOM.render(
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
  <App />,
  document.getElementById('root')
);

