import { checkIsUuidV7 } from "#shared/services/id/checkIsUuidV7";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(checkIsUuidV7, () => {
  test("rejects an empty string", () => {
    expect.hasAssertions();

    expect(checkIsUuidV7("")).toBe(false);
  });

  test("accepts a v7 uuid", () => {
    expect.hasAssertions();

    expect(checkIsUuidV7(v7())).toBe(true);
  });

  test("refuses the v4 layout the repo no longer mints", () => {
    expect.hasAssertions();

    expect(checkIsUuidV7("00000000-0000-4000-8000-000000000000")).toBe(false);
  });
});
