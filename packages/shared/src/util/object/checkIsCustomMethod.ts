import type { ObjectMethod } from "#src/models/object/ObjectMethod";

export const checkIsCustomMethod = (value: object, methodName: ObjectMethod): boolean => {
  const method = Reflect.get(value, methodName);
  return typeof method === "function" && method !== Object.prototype[methodName];
};
