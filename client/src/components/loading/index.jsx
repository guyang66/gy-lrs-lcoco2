import React from "react";
import "./index.styl";
import {Spin, Space} from 'antd';

const Loading = () => {
  return (
    <div className="full-loading-container FBV FBAC FBJC">
      <Space size="middle">
        <Spin size="large" tip="Loading..." />
      </Space>
    </div>
  )
}
export default Loading
