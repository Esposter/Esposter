import { getLatestCompatibleTag } from "#src/services/outdatedDependencies/tag/getLatestCompatibleTag";
import { describe, expect, test } from "vitest";

describe(getLatestCompatibleTag, () => {
  test("takes the newest release of the same prefix, suffix and length", () => {
    expect.hasAssertions();

    expect(getLatestCompatibleTag("v0.0.0-a", ["v0.0.1-a", "v0.1.0-a", "v0.0.10-a"])).toBe("v0.1.0-a");
  });

  test("compares release parts as numbers", () => {
    expect.hasAssertions();

    expect(getLatestCompatibleTag("0.0.9", ["0.0.10"])).toBe("0.0.10");
  });

  test("ignores a tag of another shape", () => {
    expect.hasAssertions();

    expect(getLatestCompatibleTag("0.0.0-a", ["1.0.0", "1.0.0-b", "v1.0.0-a", "1.0-a", "a"])).toBe("0.0.0-a");
  });

  test("keeps the current tag when nothing newer shares its shape", () => {
    expect.hasAssertions();

    expect(getLatestCompatibleTag("0.0.1", ["0.0.0"])).toBe("0.0.1");
  });
});
