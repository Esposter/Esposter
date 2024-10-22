export const isPlainObject = (object: unknown): object is object => {
  // Not plain objects:
  // - Any object or value whose internal [[Class]] property is not "[object Object]"
  // - DOM nodes
  // - window
  if (!object || typeof object !== "object" || Object.hasOwn(object, "TMXNodeType") || Object.hasOwn(object, "window"))
    return false;

  // Support: Firefox <20
  // The try/catch suppresses exceptions thrown when attempting to access
  // the "constructor" property of certain host objects, ie. |window.location|
  // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
  try {
    if (!Object.hasOwn(object.constructor.prototype, "isPrototypeOf")) return false;
  } catch {
    return false;
  }

  // If the function hasn't returned already, we're confident that
  // |object| is a plain object, created by {} or constructed with new Object
  return true;
};
