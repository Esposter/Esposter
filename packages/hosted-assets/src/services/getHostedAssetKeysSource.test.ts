import { getHostedAssetKeysSource } from "#src/services/getHostedAssetKeysSource";
import { describe, expect, test } from "vitest";

describe(getHostedAssetKeysSource, () => {
  test("nests a name by its segments, keeping a name that prefixes others under self and quoting a numeric segment", () => {
    expect.hasAssertions();

    const source = getHostedAssetKeysSource(
      "Fixture",
      "fixtureLock.json",
      [
        ["domains", "domains"],
        ["domains/weeklyBosses", "domains/weeklyBosses"],
        ["quests/11018", "quests/11018"],
      ],
      [["bookBody/English", "bookBody/English"]],
    );

    expect(source).toMatchInlineSnapshot(`
      "/* oxlint-disable selector-ban/no-restricted-syntax -- a mirror of the lock's keys, so each key keeps the spelling its
         lock entry gives it */
      import type { ValueOfDeep } from "type-fest";

      // The lock's keys as a nested constant, each path nested by its segments.
      // FixtureKey is the union of its leaf paths, which readers may use to name a key.
      // Generated from fixtureLock.json by the hosted-assets keys renderer; do not edit
      export const FixtureKeys = {
        domains: {
          self: "domains",
          weeklyBosses: "domains/weeklyBosses",
        },
        quests: {
          "11018": "quests/11018",
        },
      } as const;

      export const FixtureIndexKeys = {
        bookBody: {
          English: "bookBody/English",
        },
      } as const;

      export type FixtureIndexKey = ValueOfDeep<typeof FixtureIndexKeys>;
      export type FixtureKey = ValueOfDeep<typeof FixtureKeys>;
      export type FixtureKeyOf<D extends keyof typeof FixtureKeys> = ValueOfDeep<(typeof FixtureKeys)[D]>;
      "
    `);
  });

  test("breaks a value after its name when the line is over the formatter's width, as the formatter does", () => {
    expect.hasAssertions();

    const source = getHostedAssetKeysSource(
      "Fixture",
      "fixtureLock.json",
      [
        [
          "SceneBattleForestBackgroundWithAVeryLongDerivedNameThatNeedsWrapping",
          "dungeons/scene/battle/forestBackground/wrapping/long/path.png",
        ],
      ],
      [],
    );

    expect(source).toMatchInlineSnapshot(`
      "/* oxlint-disable selector-ban/no-restricted-syntax -- a mirror of the lock's keys, so each key keeps the spelling its
         lock entry gives it */
      import type { ValueOfDeep } from "type-fest";

      // The lock's keys as a nested constant, each path nested by its segments.
      // FixtureKey is the union of its leaf paths, which readers may use to name a key.
      // Generated from fixtureLock.json by the hosted-assets keys renderer; do not edit
      export const FixtureKeys = {
        SceneBattleForestBackgroundWithAVeryLongDerivedNameThatNeedsWrapping:
          "dungeons/scene/battle/forestBackground/wrapping/long/path.png",
      } as const;

      export const FixtureIndexKeys = {} as const;

      export type FixtureIndexKey = ValueOfDeep<typeof FixtureIndexKeys>;
      export type FixtureKey = ValueOfDeep<typeof FixtureKeys>;
      export type FixtureKeyOf<D extends keyof typeof FixtureKeys> = ValueOfDeep<(typeof FixtureKeys)[D]>;
      "
    `);
  });

  test("holds a derived name's lock key as its value, which is not the name", () => {
    expect.hasAssertions();

    const source = getHostedAssetKeysSource(
      "Fixture",
      "fixtureLock.json",
      [["SceneBattleForestBackground", "dungeons/Scene/Battle/ForestBackground.png"]],
      [],
    );

    expect(source).toContain(
      'export const FixtureKeys = {\n  SceneBattleForestBackground: "dungeons/Scene/Battle/ForestBackground.png",\n} as const;',
    );
  });

  test("keeps a segment named after an Object.prototype member as a key of its own, computing __proto__ so it is an own property", () => {
    expect.hasAssertions();

    const source = getHostedAssetKeysSource(
      "Fixture",
      "fixtureLock.json",
      [
        ["__proto__", "__proto__"],
        ["a/constructor", "a/constructor"],
        ["a/toString", "a/toString"],
      ],
      [],
    );

    expect(source).toMatchInlineSnapshot(`
      "/* oxlint-disable selector-ban/no-restricted-syntax -- a mirror of the lock's keys, so each key keeps the spelling its
         lock entry gives it */
      import type { ValueOfDeep } from "type-fest";

      // The lock's keys as a nested constant, each path nested by its segments.
      // FixtureKey is the union of its leaf paths, which readers may use to name a key.
      // Generated from fixtureLock.json by the hosted-assets keys renderer; do not edit
      export const FixtureKeys = {
        ["__proto__"]: "__proto__",
        a: {
          constructor: "a/constructor",
          toString: "a/toString",
        },
      } as const;

      export const FixtureIndexKeys = {} as const;

      export type FixtureIndexKey = ValueOfDeep<typeof FixtureIndexKeys>;
      export type FixtureKey = ValueOfDeep<typeof FixtureKeys>;
      export type FixtureKeyOf<D extends keyof typeof FixtureKeys> = ValueOfDeep<(typeof FixtureKeys)[D]>;
      "
    `);
  });

  test("refuses two lock keys that derive one name, naming the name", () => {
    expect.hasAssertions();

    expect(() =>
      getHostedAssetKeysSource(
        "Fixture",
        "fixtureLock.json",
        [
          ["ForestBackground", "dungeons/forestBackground.png"],
          ["ForestBackground", "dungeons/ForestBackground.png"],
        ],
        [],
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: ForestBackground is derived by two lock keys, so it names only one of them]`,
    );
  });

  test("reports a key whose self slot a literal self segment already holds, in either insertion order", () => {
    expect.hasAssertions();

    expect(() =>
      getHostedAssetKeysSource(
        "Fixture",
        "fixtureLock.json",
        [
          ["a/self", "a/self"],
          ["a", "a"],
        ],
        [],
      ),
    ).toThrowErrorMatchingInlineSnapshot(`[Error: a shares its self slot with a segment named self in the lock]`);
    expect(() =>
      getHostedAssetKeysSource(
        "Fixture",
        "fixtureLock.json",
        [
          ["a", "a"],
          ["a/self", "a/self"],
        ],
        [],
      ),
    ).toThrowErrorMatchingInlineSnapshot(`[Error: a/self shares its self slot with a segment named self in the lock]`);
  });

  test("reports a key whose self slot a literal self segment's branch holds, when that segment leads to a deeper branch", () => {
    expect.hasAssertions();

    expect(() =>
      getHostedAssetKeysSource(
        "Fixture",
        "fixtureLock.json",
        [
          ["a/self/x", "a/self/x"],
          ["a", "a"],
        ],
        [],
      ),
    ).toThrowErrorMatchingInlineSnapshot(`[Error: a shares its self slot with a segment named self in the lock]`);
  });

  test("reports a key whose self slot a path through a literal self segment would move, when the key comes first", () => {
    expect.hasAssertions();

    expect(() =>
      getHostedAssetKeysSource(
        "Fixture",
        "fixtureLock.json",
        [
          ["a", "a"],
          ["a/self/x", "a/self/x"],
        ],
        [],
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[Error: a/self/x shares its self slot with a segment named self in the lock]`,
    );
  });
});
