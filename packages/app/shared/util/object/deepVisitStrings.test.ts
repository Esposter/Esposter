import { deepVisitStrings } from "#shared/util/object/deepVisitStrings";
import { describe, expect, test } from "vitest";

describe(deepVisitStrings, () => {
  test("should visit every string leaf across nested arrays and objects", () => {
    expect.hasAssertions();

    const visited: string[] = [];
    deepVisitStrings({ a: "one", b: ["two", { c: "three" }], d: 1, e: null, f: undefined, g: new Date(0) }, (value) =>
      visited.push(value),
    );

    expect(visited).toStrictEqual(["one", "two", "three"]);
  });

  test("should visit a bare string value", () => {
    expect.hasAssertions();

    const visited: string[] = [];
    deepVisitStrings("one", (value) => visited.push(value));

    expect(visited).toStrictEqual(["one"]);
  });
});
