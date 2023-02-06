import NotFount from "@pages/404";
import AccessDeny from "@pages/403"
import Login from '@pages/login'

// 公共路由不需要走服务端。
const publicPageRoutes = [
  {
    path: '/login',
    component: Login,
    exact: true,
    key: 'login',
  },
  {
    path: '/403',
    component: AccessDeny,
    exact: true,
    key: 'error-403',
  },
  {
    path: '/404',
    component: NotFount,
    exact: true,
    key: 'error-404',
  },
];

export default publicPageRoutes;
