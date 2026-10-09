import { formatAge } from "#src/services/fleet/formatAge";
import { describe, expect, test } from "vitest";

describe(formatAge, () => {
  const MINUTE = 60_000;

  test("reads an age under an hour in minutes", () => {
    expect.hasAssertions();

    expect(formatAge(7 * MINUTE + 30_000)).toBe("7 min");
  });

  test("reads an age of an hour or more in whole hours", () => {
    expect.hasAssertions();

    expect(formatAge(125 * MINUTE)).toBe("2 h");
  });
});
