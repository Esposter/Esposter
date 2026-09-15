import { deepVisitStrings } from "#shared/util/object/deepVisitStrings";
import { describe, expect, test } from "vitest";

describe(deepVisitStrings, () => {
  test("should visit every string leaf across nested arrays and objects", () => {
    expect.hasAssertions();

    const visited: string[] = [];
    deepVisitStrings({ a: "a", b: ["b", { c: "c" }], d: 1, e: null, f: undefined, g: new Date(0) }, (value) => {
      visited.push(value);
    });

    expect(visited).toStrictEqual(["a", "b", "c"]);
  });

  test("should visit a bare string value", () => {
    expect.hasAssertions();

    const visited: string[] = [];
    deepVisitStrings("a", (value) => {
      visited.push(value);
    });

    expect(visited).toStrictEqual(["a"]);
  });
});
