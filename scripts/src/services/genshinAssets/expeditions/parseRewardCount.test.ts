import { InvalidOperationError } from "@esposter/shared";
import { parseRewardCount } from "#src/services/genshinAssets/expeditions/parseRewardCount";
import { describe, expect, test } from "vitest";

describe(parseRewardCount, () => {
  test("should read a fixed count as both its least and its most", () => {
    expect.hasAssertions();
    expect(parseRewardCount("625")).toStrictEqual({ maxCount: 625, minCount: 625 });
  });

  test("should read a range as its least and its most", () => {
    expect.hasAssertions();
    expect(parseRewardCount("4;5")).toStrictEqual({ maxCount: 5, minCount: 4 });
  });

  test("should refuse a range whose least is above its most", () => {
    expect.hasAssertions();
    expect(() => parseRewardCount("5;4")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: reward count, 5;4]`,
    );
  });

  test.each(["", "4;", ";5", "4;5;6"])("should refuse %j, its parts not one or two numbers", (count) => {
    expect.hasAssertions();
    expect(() => parseRewardCount(count)).toThrowError(InvalidOperationError);
  });
});
