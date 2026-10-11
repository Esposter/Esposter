// An object made by a literal, `JSON.parse` or `Object.create(null)`, so its own keys are its whole content
export const checkIsPlainObject = (data: unknown): data is Record<string, unknown> => {
  if (typeof data !== "object" || data === null) return false;
  const prototype = Object.getPrototypeOf(data);
  return prototype === null || prototype === Object.prototype;
};
