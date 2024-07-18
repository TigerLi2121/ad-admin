/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState: { currentUser?: any } | undefined) {
  const { perms } = initialState?.currentUser || {};
  if (perms) {
    return {
      UserAdd: perms.includes('user:add'),
      UserUpdate: perms.includes('user:update'),
      UserDelete: perms.includes('user:delete'),
      MenuAdd: perms.includes('menu:add'),
      MenuUpdate: perms.includes('menu:update'),
      MenuDelete: perms.includes('menu:delete'),
      RoleAdd: perms.includes('role:add'),
      RoleUpdate: perms.includes('role:update'),
      RoleDelete: perms.includes('role:delete'),
    };
  }
  return {};
}
