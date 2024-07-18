export default [
  { path: '/login', name: '登录', component: './Login', layout: false },
  { path: '/welcome', name: '欢迎', icon: 'smile', component: './Welcome' },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
  { path: '/sys', redirect: '/sys/user' },
  { path: '/sys/user', component: './sys/User' },
  { path: '/sys/role', component: './sys/Role' },
  { path: '/sys/menu', component: './sys/Menu' },
];
