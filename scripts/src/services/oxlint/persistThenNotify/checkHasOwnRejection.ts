import { checkIsPromiseReject } from "#src/services/oxlint/persistThenNotify/checkIsPromiseReject";
import { collectOwnNodes } from "#src/services/oxlint/persistThenNotify/collectOwnNodes";

// A `throw` or `Promise.reject` this function reaches without entering a nested one: one inside a deeper callback
// Belongs to that callback, not to this handler.
export const checkHasOwnRejection = (value: unknown): boolean =>
  collectOwnNodes(value, (node) => {
    if (node.type === "ThrowStatement") return [true];
    if (node.type === "ReturnStatement" && node.argument && checkIsPromiseReject(node.argument)) return [true];
    return undefined;
  }).length > 0;
