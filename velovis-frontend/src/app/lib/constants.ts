export const PERMISSIONS = {
  USERS: {
    READ: 'users:read',
    ASSIGN_ROLE: 'users:assign_role',
    DELETE: 'users:delete',
  },
  ROLES: {
    CREATE: 'roles:create',
    READ: 'roles:read',
    UPDATE: 'roles:update',
    DELETE: 'roles:delete',
  },
  CATEGORIES: {
    CREATE: 'categories:create',
    UPDATE: 'categories:update',
    DELETE: 'categories:delete',
  },
  PRODUCTS: {
    CREATE: 'products:create',
    UPDATE: 'products:update',
    DELETE: 'products:delete',
  },
  PRODUCT_PHOTOS: {
    CREATE: 'product_photos:create',
    UPDATE: 'product_photos:update',
    DELETE: 'product_photos:delete',
  },
  COMMENTS: {
    CREATE: 'comments:create',
    UPDATE_OWN: 'comments:update:own',
    DELETE_OWN: 'comments:delete:own',
    DELETE_ANY: 'comments:delete:any',
  },
  CARTS: {
    READ_OWN: 'carts:read:own',
    UPDATE_OWN: 'carts:update:own',
  },
  ORDERS: {
    CREATE_OWN: 'orders:create:own',
    READ_OWN: 'orders:read:own',
    READ_ANY: 'orders:read:any',
    UPDATE_ANY: 'orders:update:any',
  },
} as const;