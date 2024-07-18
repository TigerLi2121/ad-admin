import { Request, Response } from 'express';

export default {
  'GET /api/user/current': (req: Request, res: Response) => {
    const { xtoken } = req.headers;
    console.log('xtoken:', xtoken);
    if (!xtoken) {
      res.send({
        code: 886,
        msg: 'token无效',
      });
      return;
    }
    res.send({
      code: 0,
      msg: 'success',
      data: {
        id: 1,
        created_at: '2023-07-10 18:32:32',
        updated_at: '2023-07-10 18:32:32',
        username: 'admin',
        password: '',
        email: '',
        mobile: '',
        status: 1,
        role_ids: null,
        menus: [
          {
            id: 1,
            pid: 0,
            name: '系统管理',
            path: '/sys',
            icon: 'menu',
            children: [
              {
                id: 10,
                pid: 1,
                name: '角色管理',
                path: '/sys/role',
                icon: '',
                children: [],
              },
              {
                id: 6,
                pid: 1,
                name: '用户管理',
                path: '/sys/user',
                icon: '',
                children: [],
              },
              {
                id: 2,
                pid: 1,
                name: '菜单管理',
                path: '/sys/menu',
                icon: '',
                children: [],
              },
            ],
          },
        ],
        perms: [
          'role:delete',
          'role:update',
          'role:add',
          'user:delete',
          'user:update',
          'user:add',
          'menu:delete',
          'menu:update',
          'menu:add',
        ],
      },
    });
  },
  'GET /api/user': {
    code: 0,
    data: [
      {
        id: 1,
        created_at: '2023-07-10 18:32:32',
        updated_at: '2023-07-10 18:32:32',
        username: 'admin',
        password: '',
        email: '888888@qq.com',
        mobile: '13888888888',
        status: 1,
        role_ids: [1],
        menus: null,
        perms: null,
      },
    ],
    msg: 'success',
    total: 1,
  },
  'POST /api/user': async (req: Request, res: Response) => {
    console.log(req.body);
    res.send({
      code: 0,
      msg: 'success',
    });
  },
  'DELETE /api/user': async (req: Request, res: Response) => {
    console.log(req.body);
    res.send({
      code: 0,
      msg: 'success',
    });
  },
  'POST /api/login': async (req: Request, res: Response) => {
    const { password, username } = req.body;
    if (password === 'admin' && username === 'admin') {
      res.send({
        code: 0,
        msg: 'success',
        data: { token: 'admin' },
      });
      return;
    }
    if (password === 'user' && username === 'user') {
      res.send({
        code: 0,
        msg: 'success',
        data: { token: 'user' },
      });
      return;
    }

    res.send({
      code: 886,
      msg: '账号或密码错误',
    });
  },
};
