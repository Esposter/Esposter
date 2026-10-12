import { getLastJsonObject } from "#src/services/review/getLastJsonObject";
import { describe, expect, test } from "vitest";

describe(getLastJsonObject, () => {
  test("takes the last top-level object past prose", () => {
    expect.hasAssertions();

    expect(getLastJsonObject('reviewing "a" now {"x":1} and then {"findings":[]}')).toBe('{"findings":[]}');
  });

  test("keeps braces inside a string and nested objects whole", () => {
    expect.hasAssertions();

    expect(getLastJsonObject(String.raw`{"a":{"b":"}\"{"}}`)).toBe(String.raw`{"a":{"b":"}\"{"}}`);
  });

  test("returns undefined when no object closes", () => {
    expect.hasAssertions();

    expect(getLastJsonObject("no object {here")).toBeUndefined();
  });
});
