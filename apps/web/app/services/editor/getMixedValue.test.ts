import { getMixedValue } from "@/services/editor/getMixedValue";
import { describe, expect, test } from "vitest";

describe(getMixedValue, () => {
  test("differing values show as mixed", () => {
    expect.hasAssertions();

    expect(getMixedValue(["", " "])).toStrictEqual({ isMixed: true });
  });

  test("matching values show the one value they share", () => {
    expect.hasAssertions();

    expect(getMixedValue(["", ""])).toStrictEqual({ isMixed: false, value: "" });
  });

  test("no element selected has no value to show", () => {
    expect.hasAssertions();

    expect(getMixedValue([])).toBeUndefined();
  });
});
