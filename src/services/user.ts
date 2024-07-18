import { request } from '@umijs/max';

export async function currentUser() {
  return request('/api/user/current', {
    method: 'GET',
  });
}

export async function getUser(data: { [key: string]: any }) {
  return request('/api/user', {
    method: 'GET',
    params: {
      page: data.current,
      limit: data.pageSize,
      ...data,
    },
  });
}

export async function postUser(data: API.User) {
  return request('/api/user', {
    method: 'POST',
    data,
  });
}

export async function delUser(data: number[]) {
  return request('/api/user', {
    method: 'DELETE',
    data,
  });
}
