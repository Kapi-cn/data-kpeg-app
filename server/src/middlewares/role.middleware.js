export const roleMiddleware = (...allowRoles) => {
  return async (c, next) => {
    const user = c.get('user');

    if (!user || !allowRoles.includes(user.role)) {
      return c.json({
        message: 'Anda tidak memiliki izin untuk melakukan aksi ini',
      }, 403);
    }

    await next();
  }
}