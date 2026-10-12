import { ObjectMethod } from "#src/models/object/ObjectMethod";
import { checkIsCustomMethod } from "#src/util/object/checkIsCustomMethod";
import { checkIsSameBytes } from "#src/util/object/checkIsSameBytes";
import { checkIsSameValueZero } from "#src/util/object/checkIsSameValueZero";
import { getEnumerableKeys } from "#src/util/object/getEnumerableKeys";

// A shared buffer is a global only where the page is cross-origin isolated, so its constructor is looked up rather than named
const checkIsBinary = (value: unknown): value is ArrayBuffer | ArrayBufferView | SharedArrayBuffer =>
  ArrayBuffer.isView(value) ||
  value instanceof ArrayBuffer ||
  (typeof SharedArrayBuffer !== "undefined" && value instanceof SharedArrayBuffer);

export const checkIsDeepEqual = (first: unknown, second: unknown): boolean => {
  if (first === second) return true;
  if (typeof first !== "object" || typeof second !== "object" || first === null || second === null)
    return checkIsSameValueZero(first, second);
  // The prototypes, not the `constructor` property, which a plain object may carry as a data field of its own
  if (Object.getPrototypeOf(first) !== Object.getPrototypeOf(second)) return false;

  if (Array.isArray(first) || Array.isArray(second)) {
    if (!Array.isArray(first) || !Array.isArray(second) || first.length !== second.length) return false;
    for (const [index, item] of first.entries()) if (!checkIsDeepEqual(item, second[index])) return false;
    return true;
  }

  if (checkIsBinary(first) && checkIsBinary(second)) return checkIsSameBytes(first, second);
  if (first instanceof RegExp && second instanceof RegExp)
    return first.source === second.source && first.flags === second.flags;
  // A weak collection, a promise or a blob has no entries or bytes to compare synchronously, so only its identity says whether two are the same
  if (first instanceof WeakMap || first instanceof WeakSet || first instanceof Promise || first instanceof Blob)
    return false;

  if (checkIsCustomMethod(first, ObjectMethod.ValueOf) && checkIsCustomMethod(second, ObjectMethod.ValueOf))
    return checkIsSameValueZero(first.valueOf(), second.valueOf());
  if (checkIsCustomMethod(first, ObjectMethod.ToString) && checkIsCustomMethod(second, ObjectMethod.ToString))
    // oxlint-disable-next-line typescript/no-base-to-string -- checkIsCustomMethod has confirmed the toString is the value's own, not Object.prototype's
    return first.toString() === second.toString();

  if (first instanceof Map && second instanceof Map) {
    if (first.size !== second.size) return false;
    for (const [key, value] of first) if (!second.has(key) || !checkIsDeepEqual(value, second.get(key))) return false;
    return true;
  }
  if (first instanceof Set && second instanceof Set) {
    if (first.size !== second.size) return false;
    for (const value of first) if (!second.has(value)) return false;
    return true;
  }

  const firstKeys = getEnumerableKeys(first);
  if (firstKeys.length !== getEnumerableKeys(second).length) return false;
  return firstKeys.every(
    (key) =>
      Object.prototype.propertyIsEnumerable.call(second, key) &&
      checkIsDeepEqual(Reflect.get(first, key), Reflect.get(second, key)),
  );
};
