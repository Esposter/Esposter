import { joinWithOxfordOr } from "#shared/util/text/joinWithOxfordOr";
import { describe, expect, test } from "vitest";

describe(joinWithOxfordOr, () => {
  test("joins", () => {
    expect.hasAssertions();

    expect(joinWithOxfordOr([""])).toBe("");
    expect(joinWithOxfordOr(["", ""])).toBe(" or ");
    expect(joinWithOxfordOr(["", "", ""])).toBe(", , or ");
  });
});
