import { describe } from "vitest";

// The epoch as a plain date, computed rather than typed, so every suite of the library's date components spells it
// The one way. It fell on a Thursday, so its week starts in the December before it
export const TEST_EPOCH_DATE: Temporal.PlainDate = Temporal.Instant.fromEpochMilliseconds(0)
  .toZonedDateTimeISO("UTC")
  .toPlainDate();

describe.todo("constants");
