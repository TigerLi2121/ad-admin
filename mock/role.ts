import { Request, Response } from 'express';

export default {
  // GET POST 可省略
  'GET /api/role': {
    code: 0,
    data: [
      {
        id: 1,
        created_at: '2023-07-10 18:32:32',
        updated_at: '2023-07-10 18:32:32',
        name: '研发',
        menu_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
      },
      {
        id: 2,
        created_at: '2023-07-10 18:32:32',
        updated_at: '2023-07-10 18:32:32',
        name: '测试',
        menu_ids: null,
      },
      {
        id: 3,
        created_at: '2023-07-10 18:32:32',
        updated_at: '2023-07-10 18:32:32',
        name: '产品',
        menu_ids: [ 1,10,13],
      },
    ],
    msg: 'success',
    total: 3,
  },
  'POST /api/role': async (req: Request, res: Response) => {
    console.log(req.body);
    res.send({
      code: 0,
      msg: 'success',
    });
  },
  'DELETE /api/role': async (req: Request, res: Response) => {
    console.log(req.body);
    res.send({
      code: 0,
      msg: 'success',
    });
  },
};
