import { base64ToHex } from "#src/services/cutover/objects/base64ToHex";
import { describe, expect, test } from "vitest";

describe(base64ToHex, () => {
  test("reads a base64 digest as its hex bytes", () => {
    expect.hasAssertions();

    expect(base64ToHex("AQID")).toStrictEqual("010203");
  });

  test("keeps the high bit of a byte", () => {
    expect.hasAssertions();

    expect(base64ToHex("/w==")).toStrictEqual("ff");
  });
});
