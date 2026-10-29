import { describe, expect, test } from "vitest";

// The calendar date of the Unix epoch, the one fixed date the ledger tests date a row or a trailer with
export const EPOCH_DATE: string = new Date(0).toISOString().slice(0, 10);

describe("EPOCH_DATE", () => {
  test("is a calendar date in the form the ledger writes", () => {
    expect.hasAssertions();

    expect(EPOCH_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
  });
});
