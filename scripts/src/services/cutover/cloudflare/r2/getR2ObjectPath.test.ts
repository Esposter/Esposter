import { getR2ObjectPath } from "#src/services/cutover/cloudflare/r2/getR2ObjectPath";
import { describe, expect, test } from "vitest";

describe(getR2ObjectPath, () => {
  test("percent-encodes each segment of the key and keeps its slashes", () => {
    expect.hasAssertions();

    expect(getR2ObjectPath("bucket", "a b/c+d")).toBe("/bucket/a%20b/c%2Bd");
  });

  test("names the bucket itself for an empty key", () => {
    expect.hasAssertions();

    expect(getR2ObjectPath("bucket", "")).toBe("/bucket/");
  });

  test("refuses a dot segment, which a URL would resolve away", () => {
    expect.hasAssertions();

    expect(() => getR2ObjectPath("bucket", "a/../b")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: a/../b, has a . or .. segment, which a URL resolves away]`,
    );
  });
});
