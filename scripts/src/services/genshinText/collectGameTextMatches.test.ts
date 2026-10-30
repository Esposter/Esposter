import { collectGameTextMatches } from "#src/services/genshinText/collectGameTextMatches";
import { describe, expect, test } from "vitest";

describe(collectGameTextMatches, () => {
  // The manual text map names the corridor's string, and the unnamed string is filed under its hash alone
  const CORRIDOR_NAME = "UI_TOWER_CORRIDOR";
  const CORRIDOR_HASH = "1";
  const UNNAMED_HASH = "2";

  test("a matched string is filed under its hash, named by the manual text map and keyed by the member that takes it, the named ones first", () => {
    expect.hasAssertions();

    const englishTextMap = new Map([
      [CORRIDOR_HASH, "Corridor"],
      [UNNAMED_HASH, "Corridor"],
      [UNNAMED_HASH.repeat(2), "Other"],
    ]);
    const manualTextMap = new Map([[CORRIDOR_NAME, CORRIDOR_HASH]]);

    expect(collectGameTextMatches(englishTextMap, manualTextMap, (text) => text === "Corridor")).toStrictEqual([
      { id: CORRIDOR_HASH, key: "AbyssCorridor", name: CORRIDOR_NAME, values: {} },
      { id: UNNAMED_HASH, values: {} },
    ]);
  });

  test("the predicate is given the names a string is filed under, or its hash where there are none", () => {
    expect.hasAssertions();

    const englishTextMap = new Map([
      [CORRIDOR_HASH, "Corridor"],
      [UNNAMED_HASH, "Corridor"],
    ]);
    const manualTextMap = new Map([[CORRIDOR_NAME, CORRIDOR_HASH]]);

    expect(
      collectGameTextMatches(englishTextMap, manualTextMap, (_text, ids) => ids.includes(CORRIDOR_NAME)).map(
        ({ id }) => id,
      ),
    ).toStrictEqual([CORRIDOR_HASH]);
    expect(
      collectGameTextMatches(englishTextMap, manualTextMap, (_text, ids) => ids.includes(UNNAMED_HASH)).map(
        ({ id }) => id,
      ),
    ).toStrictEqual([UNNAMED_HASH]);
  });
});
