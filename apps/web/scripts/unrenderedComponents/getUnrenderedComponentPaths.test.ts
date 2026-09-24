import { getUnrenderedComponentPaths } from "@@/scripts/unrenderedComponents/getUnrenderedComponentPaths";
import { describe, expect, test } from "vitest";

describe(getUnrenderedComponentPaths, () => {
  test("renders every component somewhere", () => {
    expect.hasAssertions();

    expect(getUnrenderedComponentPaths()).toStrictEqual([]);
  });
});
