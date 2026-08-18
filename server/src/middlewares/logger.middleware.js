export const logger = async (c, next) => {
  console.log(`${c.req.method} ${c.req.path}`);

  await next();
};
