import { getPropertyNames } from "@/util/object/getPropertyNames";
import { describe, expect, test } from "vitest";

describe(getPropertyNames, () => {
  test("empty string key", () => {
    expect.hasAssertions();

    const properties = getPropertyNames<{ "": string }>();

    expect(properties[""]).toBe("");
  });
});
