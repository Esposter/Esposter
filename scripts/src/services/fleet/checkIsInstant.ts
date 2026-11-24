import { getResult } from "@esposter/shared";

// Whether a value is an instant Temporal reads, since a machine's record is aged by its instants and a malformed one
// Must not throw
export const checkIsInstant = (value: unknown): boolean =>
  typeof value === "string" &&
  getResult(() => Temporal.Instant.from(value)).match(
    () => true,
    // A value Temporal refuses is not an instant, which is the answer this check gives
    () => false,
  );
