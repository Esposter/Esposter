import { InvalidOperationError } from "#src/models/error/InvalidOperationError";
import { Operation } from "#src/models/shared/Operation";

// The annotation belongs on the variable rather than on the arrow's return type: a call only counts as
// Never-returning — what lets an exhaustive `switch` prove a variable assigned in every case — when the
// Callee is a `const` carrying an explicit type annotation, and an annotated return type on the initializer
// Does not qualify. A generated `.d.ts` emits the annotated form either way, so dropping it breaks only the
// Consumers that resolve source, which is every workspace one, and reads there as
// `TS2454: used before being assigned` at the call site's caller rather than as anything about this file.
export const exhaustiveGuard: (value: never) => never = (value) => {
  throw new InvalidOperationError(Operation.Read, exhaustiveGuard.name, JSON.stringify(value));
};
