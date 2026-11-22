import { describe } from "vitest";

// The calendar date of the Unix epoch, the one fixed date the ledger tests date a row or a trailer with
export const EPOCH_DATE: string = new Date(0).toISOString().slice(0, 10);
// The calendar date one day after it, for a trailer or a pass that comes later
export const DAY_AFTER_EPOCH_DATE: string = new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds"))
  .toISOString()
  .slice(0, 10);

describe.todo("constants");
