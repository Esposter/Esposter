import { checkIsUuidV4 } from "#src/util/id/uuid/checkIsUuidV4";
import { describe, expect, test } from "vitest";

describe(checkIsUuidV4, () => {
  test("empty string", () => {
    expect.hasAssertions();

    expect(checkIsUuidV4("")).toBe(false);
  });

  test("validates v4 uuids", () => {
    expect.hasAssertions();

    expect(checkIsUuidV4(crypto.randomUUID())).toBe(true);
  });
});
