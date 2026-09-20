import { describe } from "vitest";

// The epoch as a plain date, computed rather than typed, so every suite spells it the one way. A birthday is
// Compared inside one leap year wherever it is read, so the epoch's own year never reaches an assertion
export const TEST_EPOCH_DATE: Temporal.PlainDate = Temporal.Instant.fromEpochMilliseconds(0)
  .toZonedDateTimeISO("UTC")
  .toPlainDate();

describe.todo("constants");
