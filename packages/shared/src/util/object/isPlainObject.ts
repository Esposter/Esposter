export const isPlainObject = (data: unknown): data is object => {
  if (typeof data !== "object" || data === null) return false;
  const prototype = Object.getPrototypeOf(data);
  return prototype === null || prototype === Object.prototype;
};
