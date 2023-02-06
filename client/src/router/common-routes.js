import Welcome from "@pages/views/welcome";
import Room from "@pages/views/room";

const publicRoutes = [
  {
    path: '/index',
    name: '首页',
    key: 'index',
    exact: true,
    component: Welcome,
  },
  {
    path: '/room',
    name: '房间',
    key: 'room',
    exact: true,
    component: Room,
  },
];

export default publicRoutes;
