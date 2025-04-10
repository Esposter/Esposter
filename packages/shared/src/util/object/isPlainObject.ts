export const isPlainObject = (data: unknown): data is Record<PropertyKey, unknown> => {
  if (typeof data !== "object" || data === null) return false;

  const prototype = Object.getPrototypeOf(data);
  return prototype === null || prototype === Object.prototype;
};
