import { reportKindCount } from "#src/services/genshinAssets/points/reportKindCount";
import { describe, expect, test } from "vitest";

describe(reportKindCount, () => {
  test("a kind short of the wiki's count is reported", () => {
    expect.hasAssertions();
    expect(reportKindCount("first", "places", 3, 5)).toBe("first: 3 places against the wiki's 5, a difference of -2");
  });

  test("a kind matching the wiki's count reports nothing", () => {
    expect.hasAssertions();
    expect(reportKindCount("second", "places", 5, 5)).toBeUndefined();
  });
});
