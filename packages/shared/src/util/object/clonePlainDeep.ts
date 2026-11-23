import { checkIsPlainObject } from "#src/util/object/checkIsPlainObject";

const clone = (data: unknown, copies: WeakMap<object, unknown>): unknown => {
  if (!Array.isArray(data) && !checkIsPlainObject(data)) return data;
  else if (copies.has(data)) return copies.get(data);
  else if (Array.isArray(data)) {
    const copy: unknown[] = [];
    copies.set(data, copy);
    for (const [index, item] of data.entries()) copy[index] = clone(item, copies);
    return copy;
  } else {
    const copy: Record<string, unknown> = {};
    copies.set(data, copy);
    for (const [key, value] of Object.entries(data)) copy[key] = clone(value, copies);
    return copy;
  }
};
// Copies every array and plain object in the tree and shares every other value.
// Functions, dates and class instances pass through, where `structuredClone` would throw or strip the prototype.
// A value reached twice is copied once, so a cycle stays a cycle in the copy.
// Reading through a reactive Proxy yields plain copies, so the result holds no proxy.
// A deep copy has its input's type.
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- a recursive walk over unknown values cannot type it
export const clonePlainDeep = <T>(data: T): T => clone(data, new WeakMap()) as T;
