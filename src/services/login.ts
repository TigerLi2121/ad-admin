import { request } from '@umijs/max';

export async function login(data: API.LoginParams) {
  return request<API.LoginResult>('/api/login', {
    method: 'POST',
    headers: { isGuest: 'true' },
    data,
  });
}
