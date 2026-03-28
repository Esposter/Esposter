import { getPropertyNames } from "@/util/object/getPropertyNames";
import { describe, expect, test } from "vitest";

describe(getPropertyNames, () => {
  test("empty string key", () => {
    expect.hasAssertions();

    const propertyNames = getPropertyNames<{ "": string }>();

    expect(propertyNames[""]).toBe("");
  });

  test("nested object", () => {
    expect.hasAssertions();

    const propertyNames = getPropertyNames<{ a: { b: string } }>();

    expect(propertyNames["a.b"]).toBe("a.b");
  });
});
