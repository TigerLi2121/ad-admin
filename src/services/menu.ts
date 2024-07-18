import { request } from '@umijs/max';

export async function getMenu() {
  return request('/api/menu', {
    method: 'GET',
  });
}

export async function postMenu(data: API.Menu) {
  return request('/api/menu', {
    method: 'POST',
    data,
  });
}

export async function delMenu(data: number[]) {
  return request('/api/menu', {
    method: 'DELETE',
    data,
  });
}
