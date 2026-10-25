import { checkIsUuidV4 } from "#shared/util/id/uuid/checkIsUuidV4";
import { describe, expect, test } from "vitest";

describe(checkIsUuidV4, () => {
  test("rejects an empty string", () => {
    expect.hasAssertions();

    expect(checkIsUuidV4("")).toBe(false);
  });

  test("accepts a v4 uuid", () => {
    expect.hasAssertions();

    expect(checkIsUuidV4(crypto.randomUUID())).toBe(true);
  });
});
