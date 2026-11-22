import { resolveWikiEnemyName } from "#src/services/genshinAssets/imaginarium/resolveWikiEnemyName";
import { describe, expect, test } from "vitest";

describe(resolveWikiEnemyName, () => {
  const monsters = [
    { describeId: 101, id: 1, name: "Ruin Scout" },
    { describeId: 202, id: 2, name: "Ruin Guard" },
    { describeId: 202, id: 3, name: "Ruin Guard" },
    { describeId: 303, id: 4, name: "Ruin Drake" },
    { describeId: 304, id: 5, name: "Ruin Drake" },
  ];

  test("a name whose monsters share one describe entry resolves to that entry", () => {
    expect.hasAssertions();

    expect(resolveWikiEnemyName("Ruin Guard", monsters)).toStrictEqual({ describeId: 202, isResolved: true });
  });

  test("a name whose monsters span several describe entries is refused with their count", () => {
    expect.hasAssertions();

    expect(resolveWikiEnemyName("Ruin Drake", monsters)).toStrictEqual({ count: 2, isResolved: false });
  });

  test("a name held by no monster is refused with a count of zero", () => {
    expect.hasAssertions();

    expect(resolveWikiEnemyName("Geovishap (Pyro)", monsters)).toStrictEqual({ count: 0, isResolved: false });
  });
});
