module.exports = app => {
  return async function(ctx, next) {
    await next();
  };
}
