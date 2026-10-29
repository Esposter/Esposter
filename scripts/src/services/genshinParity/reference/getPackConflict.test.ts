import { getPackConflict } from "#src/services/genshinParity/reference/getPackConflict";
import { describe, expect, test } from "vitest";

describe(getPackConflict, () => {
  const FILE = "a.webp";
  const HASH = "0".repeat(64);
  const OTHER_HASH = "1".repeat(64);

  test("reports nothing when the packed bytes are the committed row's", () => {
    expect.hasAssertions();
    expect(getPackConflict(FILE, HASH, HASH)).toBeUndefined();
  });

  test("reports a committed file with no manifest row", () => {
    expect.hasAssertions();
    expect(getPackConflict(FILE, HASH, undefined)).toBe(`${FILE} is committed with no manifest row`);
  });

  test("reports a scratch screenshot whose packed bytes differ from the committed row's", () => {
    expect.hasAssertions();
    expect(getPackConflict(FILE, OTHER_HASH, HASH)).toBe(
      `${FILE} packs to ${OTHER_HASH}, but its committed row says ${HASH}`,
    );
  });
});
