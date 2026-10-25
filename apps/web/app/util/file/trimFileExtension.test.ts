import { trimFileExtension } from "@/util/file/trimFileExtension";
import { describe, expect, test } from "vitest";

describe(trimFileExtension, () => {
  test.each([
    ["a.txt", "a"],
    ["a.b.txt", "a.b"],
    ["a.b/c", "a.b/c"],
  ])("trims %s to %s", (path, expected) => {
    expect.hasAssertions();

    expect(trimFileExtension(path)).toBe(expected);
  });
});
