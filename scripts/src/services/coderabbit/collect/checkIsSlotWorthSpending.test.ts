import { checkIsSlotWorthSpending } from "#src/services/coderabbit/collect/checkIsSlotWorthSpending";
import { WINDOW_FILL_TARGET } from "#src/services/coderabbit/shared/constants";
import { describe, expect, test } from "vitest";

describe(checkIsSlotWorthSpending, () => {
  test("spends the slot on a range that reaches the fill target", () => {
    expect.hasAssertions();

    expect(checkIsSlotWorthSpending({ fileCount: WINDOW_FILL_TARGET, isForced: false, isQueueOwing: true })).toBe(true);
  });

  // The case that spent an hour on two files: the range is short and the queue has more to add to it
  test("waits on a short range while the queue still owes commits", () => {
    expect.hasAssertions();

    expect(checkIsSlotWorthSpending({ fileCount: 1, isForced: false, isQueueOwing: true })).toBe(false);
  });

  test("spends the slot on a short range once the queue owes nothing", () => {
    expect.hasAssertions();

    expect(checkIsSlotWorthSpending({ fileCount: 1, isForced: false, isQueueOwing: false })).toBe(true);
  });

  test("spends the slot on a short range when forced", () => {
    expect.hasAssertions();

    expect(checkIsSlotWorthSpending({ fileCount: 1, isForced: true, isQueueOwing: true })).toBe(true);
  });
});
