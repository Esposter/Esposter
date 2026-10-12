import { ReviewWindowStatus } from "#src/models/review/ReviewWindowStatus";
import { getPassedWindowCount } from "#src/services/review/getPassedWindowCount";
import { describe, expect, test } from "vitest";

describe(getPassedWindowCount, () => {
  test("counts the passed windows before the first one that did not pass", () => {
    expect.hasAssertions();

    expect(
      getPassedWindowCount([
        ReviewWindowStatus.Passed,
        ReviewWindowStatus.Passed,
        ReviewWindowStatus.Limited,
        ReviewWindowStatus.Passed,
      ]),
    ).toBe(2);
  });

  test("counts every window when all of them passed", () => {
    expect.hasAssertions();

    expect(getPassedWindowCount([ReviewWindowStatus.Passed])).toBe(1);
  });

  test("counts none when the first window did not pass", () => {
    expect.hasAssertions();

    expect(getPassedWindowCount([ReviewWindowStatus.Failed, ReviewWindowStatus.Passed])).toBe(0);
  });

  test("counts none from no windows", () => {
    expect.hasAssertions();

    expect(getPassedWindowCount([])).toBe(0);
  });
});
