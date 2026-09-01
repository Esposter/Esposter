import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";

// The annotation is on the variable, not on the arrow's return type, and that is the whole point of it.
// TypeScript only treats a call as never-returning — the thing that lets an exhaustive `switch` prove a
// Variable assigned in every case — when the callee is a `const` carrying an explicit type annotation; an
// Annotated return type on the initializer does not qualify. A generated `.d.ts` always emits the annotated
// Form, so this worked for anything resolving `dist` and silently did not for anything resolving source,
// Which is every workspace consumer. The failure reads as `TS2454: used before being assigned` at the call
// Site's caller rather than as anything about this file.
export const exhaustiveGuard: (value: never) => never = (value) => {
  throw new InvalidOperationError(Operation.Read, exhaustiveGuard.name, JSON.stringify(value));
};
