import { getMixedValue } from "@/services/editor/getMixedValue";
import { describe, expect, test } from "vitest";

describe(getMixedValue, () => {
  test("Differing values show as mixed", () => {
    expect.hasAssertions();

    expect(getMixedValue(["", " "])).toStrictEqual({ isMixed: true });
  });

  test("Matching values show the one value they share", () => {
    expect.hasAssertions();

    expect(getMixedValue(["", ""])).toStrictEqual({ isMixed: false, value: "" });
  });

  test("No element selected has no value to show", () => {
    expect.hasAssertions();

    expect(getMixedValue([])).toBeUndefined();
  });
});
