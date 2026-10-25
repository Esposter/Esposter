import { parseKey } from "#src/services/genshinAssets/music/parseKey";
import { describe, expect, test } from "vitest";

describe(parseKey, () => {
  test("reads an uppercase accidental as a flat, as it reads a lowercase one", () => {
    expect.hasAssertions();

    expect(parseKey("CB4")).toBe(59);
  });

  test("refuses an empty value rather than reading it as the MIDI key zero", () => {
    expect.hasAssertions();

    expect(() => parseKey("")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: , not a key]`,
    );
  });
});
