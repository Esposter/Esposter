import { getOwnValue } from "#src/util/object/getOwnValue";
import { describe, expect, test } from "vitest";

describe(getOwnValue, () => {
  test("returns the value of an own entry", () => {
    expect.hasAssertions();

    expect(getOwnValue({ "": 0 }, "")).toBe(0);
  });

  test.each(["constructor", "__proto__"])("does not resolve %s through the prototype chain", (key) => {
    expect.hasAssertions();

    expect(getOwnValue({}, key)).toBeUndefined();
  });
});
