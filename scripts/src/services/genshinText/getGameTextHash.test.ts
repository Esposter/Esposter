import { getGameTextHash } from "#src/services/genshinText/getGameTextHash";
import { describe, expect, test } from "vitest";

describe(getGameTextHash, () => {
  const id = "a";
  const hash = "0";
  const manualTextMap = new Map([[id, hash]]);

  test("reads a named id off the manual text map", () => {
    expect.hasAssertions();

    expect(getGameTextHash(id, manualTextMap)).toBe(hash);
  });

  test("takes a hash as itself", () => {
    expect.hasAssertions();

    expect(getGameTextHash("1", manualTextMap)).toBe("1");
  });

  test("refuses an id the map does not file", () => {
    expect.hasAssertions();

    expect(() => getGameTextHash("b", manualTextMap)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: b, is no id the manual text map files]`,
    );
  });
});
