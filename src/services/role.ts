import { request } from '@umijs/max';

export async function getRole(data: { [key: string]: any }) {
  return request('/api/role', {
    method: 'GET',
    params: {
      page: data.current,
      limit: data.pageSize,
      ...data,
    },
  });
}

export async function postRole(data: API.Role) {
  return request('/api/role', {
    method: 'POST',
    data,
  });
}

export async function delRole(data: number[]) {
  return request('/api/role', {
    method: 'DELETE',
    data,
  });
}
