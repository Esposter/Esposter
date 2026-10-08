import { fillGameTextValues } from "#src/services/fillGameTextValues";
import { describe, expect, test } from "vitest";

describe(fillGameTextValues, () => {
  test("fills each placeholder with the value at its number", () => {
    expect.hasAssertions();

    expect(fillGameTextValues("{1} {0}/{2}", 0, "a", 1)).toBe("a 0/1");
  });

  test("fills a value holding a replacement pattern as it is, and keeps a placeholder with no value", () => {
    expect.hasAssertions();

    expect(fillGameTextValues("{0}{1}", "$&")).toBe("$&{1}");
  });
});
