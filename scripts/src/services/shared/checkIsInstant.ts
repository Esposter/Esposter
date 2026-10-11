import { getResult } from "@esposter/shared";

// Whether a value is an instant Temporal reads, since a machine's record is aged by its instants and a malformed one must
// Not throw
export const checkIsInstant = (value: unknown): boolean =>
  typeof value === "string" &&
  getResult(() => Temporal.Instant.from(value)).match(
    () => true,
    () => false,
  );
