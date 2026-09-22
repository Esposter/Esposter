import { checkIsVolume } from "#src/services/checkIsVolume";
import { describe, expect, test } from "vitest";

describe(checkIsVolume, () => {
  test.each(["0", "100"])("accepts %j", (value) => {
    expect.hasAssertions();

    expect(checkIsVolume(value)).toBe(true);
  });

  test.each(["", "a", "101", "-1", "0%", "0.1"])("rejects %j", (value) => {
    expect.hasAssertions();

    expect(checkIsVolume(value)).toBe(false);
  });
});
