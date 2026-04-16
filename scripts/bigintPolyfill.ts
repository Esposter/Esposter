// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/3609
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};
