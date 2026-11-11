import { ReviewWindowStatus } from "#src/models/review/ReviewWindowStatus";
import { checkIsBacklogOwed } from "#src/services/review/checkIsBacklogOwed";
import { describe, expect, test } from "vitest";

describe(checkIsBacklogOwed, () => {
  test("windows past the cap owe the next run when every window passed", () => {
    expect.hasAssertions();

    expect(checkIsBacklogOwed([ReviewWindowStatus.Passed], true)).toBe(true);
  });

  test("a deadline-unreached window owes the next run", () => {
    expect.hasAssertions();

    expect(checkIsBacklogOwed([ReviewWindowStatus.Passed, ReviewWindowStatus.Unreached], false)).toBe(true);
  });

  test("nothing past the cap or the deadline owes nothing", () => {
    expect.hasAssertions();

    expect(checkIsBacklogOwed([ReviewWindowStatus.Passed], false)).toBe(false);
  });

  test.each([ReviewWindowStatus.Failed, ReviewWindowStatus.Limited])(
    "a %s window owes no dispatch even past the cap",
    (status) => {
      expect.hasAssertions();

      expect(checkIsBacklogOwed([status], true)).toBe(false);
    },
  );
});
