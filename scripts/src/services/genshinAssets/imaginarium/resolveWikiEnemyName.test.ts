import { resolveWikiEnemyName } from "#src/services/genshinAssets/imaginarium/resolveWikiEnemyName";
import { describe, expect, test } from "vitest";

describe(resolveWikiEnemyName, () => {
  const monsters = [
    { id: 1, name: "Ruin Scout" },
    { id: 2, name: "Ruin Guard" },
    { id: 3, name: "Ruin Guard" },
    { id: 4, name: "" },
  ];

  test("a name held by one monster resolves to its id", () => {
    expect.hasAssertions();

    expect(resolveWikiEnemyName("Ruin Scout", monsters)).toStrictEqual({ isResolved: true, monsterId: 1 });
  });

  test("a name held by several monsters is refused with their count", () => {
    expect.hasAssertions();

    expect(resolveWikiEnemyName("Ruin Guard", monsters)).toStrictEqual({ count: 2, isResolved: false });
  });

  test("a name held by no monster is refused with a count of zero", () => {
    expect.hasAssertions();

    expect(resolveWikiEnemyName("Geovishap (Pyro)", monsters)).toStrictEqual({ count: 0, isResolved: false });
  });
});
