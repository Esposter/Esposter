import { SIZE_LIMITED_METHODS } from "#src/runtime/constants";

// A body with no declared length is counted as a handler reads it, and only a method that carries a body is counted
export const checkIsBodyCounted = (method: string, contentLength: null | string): boolean =>
  contentLength === null && SIZE_LIMITED_METHODS.includes(method);
