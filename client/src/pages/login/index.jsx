import React from "react";
import {Form, Input, Button, Checkbox, message} from 'antd';
import {LockTwoTone, UserOutlined} from '@ant-design/icons';
import {Redirect} from "react-router-dom";
import io from '@api/login'
import bg from '@assets/images/login_bg.png'
import logo from '@assets/images/logo.svg'
import DocumentTitle from "react-document-title";
import './index.styl'
import {inject, observer} from "mobx-react";

const Login = (props) => {

  const {token, setToken, setUser}  = props.appStore

  const handleUserInfo = (data) => {
    setUser(data.user)
    setToken(data.accessToken)
  }

  const onFinish = async (values) => {
    await io.login({
      username: values.username,
      password: values.password,
    }).then(data=>{
      message.success('登录成功！')
      handleUserInfo(data)
    })
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  // 如果已经登录，直接跳转到首页
  if (token) {
    return <Redirect to="/" />;
  }

  return (
    <DocumentTitle title="用户登录">
      <div className="login-container FBV FBAC" style={{background: `url(${bg}) no-repeat 100%`, backgroundSize: '100% 100%'}}>
        <div className="login-title-container mar-b40">
          <div className="logo-wrap">
            <img src={logo} alt="" />
          </div>
          <div className="desc-wrap mar-t10">lrs登录</div>
        </div>
        <div className="form-container mar-t40">
          <Form
            name="basic"
            initialValues={{remember: true}}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
            >
              <Input
                placeholder="用户名"
                prefix={(
                  <UserOutlined style={{color: '#1890ff'}} />
                )}
              />
            </Form.Item>

            <Form.Item
              name="password"
            >
              <Input.Password
                placeholder="请输入用"
                prefix={(
                  <LockTwoTone style={{color: '#1890ff'}} />
                )}
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>自动登录</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="submit-button">
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </DocumentTitle>
  )
}

export default inject('appStore')(observer(Login))
