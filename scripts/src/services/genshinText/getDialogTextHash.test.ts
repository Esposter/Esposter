import { getDialogTextHash } from "#src/services/genshinText/getDialogTextHash";
import { describe, expect, test } from "vitest";

describe(getDialogTextHash, () => {
  const HASH = 1;
  const VARIANT_HASH = 513;

  test("keeps a hash the English text map holds", () => {
    expect.hasAssertions();

    expect(
      getDialogTextHash(
        HASH,
        new Map([
          [String(HASH), "a"],
          [String(VARIANT_HASH), "b"],
        ]),
      ),
    ).toBe(HASH);
  });

  test("takes the variant hash when only it is held, in either direction", () => {
    expect.hasAssertions();

    expect(getDialogTextHash(HASH, new Map([[String(VARIANT_HASH), "a"]]))).toBe(VARIANT_HASH);
    expect(getDialogTextHash(VARIANT_HASH, new Map([[String(HASH), "a"]]))).toBe(HASH);
  });

  test("keeps a hash neither key holds", () => {
    expect.hasAssertions();

    expect(getDialogTextHash(HASH, new Map())).toBe(HASH);
  });
});
