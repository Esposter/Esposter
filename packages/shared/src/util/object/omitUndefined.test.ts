import { omitUndefined } from "#src/util/object/omitUndefined";
import { describe, expect, test } from "vitest";

describe(omitUndefined, () => {
  test("drops only the keys whose value is undefined", () => {
    expect.hasAssertions();

    expect(omitUndefined({ a: 0, b: undefined, c: null, d: "" })).toStrictEqual({ a: 0, c: null, d: "" });
  });
});
