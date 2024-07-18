// @ts-ignore
/* eslint-disable */

declare namespace API {
  type Page = {
    page?: number;
    limit?: number;
  };

  type Result = {
    code?: number;
    msg?: string;
    data?: any;
  };

  type LoginResult = {
    data?: { token?: string };
  } & Result;

  type LoginParams = {
    username?: string;
    password?: string;
  };

  type User = {
    id: number;
    username?: string;
    password?: string;
    email?: string;
    mobile?: string;
    status?: number;
    menus?: any;
    perms?: string[];
    role_ids?: [];
    created_at?: string;
    updated_at?: string;
  };

  type Role = {
    id: number;
    name: string;
    menu_ids?: number[];
    created_at?: string;
    updated_at?: string;
  };

  type Menu = {
    id: number;
    pid: number;
    name: string;
    type: number;
    path?: string;
    icon?: string;
    perms?: string;
    status?: string;
    sort?: string;
    children?: any;
    created_at?: string;
    updated_at?: string;
  };
}
