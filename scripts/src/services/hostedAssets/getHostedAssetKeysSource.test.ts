import { createHostedAssetLockObject } from "#src/services/hostedAssets/createHostedAssetLockObject.test";
import { getHostedAssetKeysSource } from "#src/services/hostedAssets/getHostedAssetKeysSource";
import { describe, expect, test } from "vitest";

describe(getHostedAssetKeysSource, () => {
  const HASH = "hash";

  test("nests a key by its segments, keeping a key that prefixes others under self and quoting a numeric segment", () => {
    expect.hasAssertions();

    const source = getHostedAssetKeysSource("Fixture", {
      indexes: { "bookBody/English": createHostedAssetLockObject("bookBody/English", HASH) },
      objects: {
        domains: createHostedAssetLockObject("domains", HASH),
        "domains/weeklyBosses": createHostedAssetLockObject("domains/weeklyBosses", HASH),
        "quests/11018": createHostedAssetLockObject("quests/11018", HASH),
      },
    });

    expect(source).toMatchInlineSnapshot(`
      "/* oxlint-disable selector-ban/no-restricted-syntax -- a mirror of the lock's own keys, which a reader looks up by a dataset's name at runtime, so a key keeps the spelling the data gives it */
      import type { ValueOfDeep } from "type-fest";

      // The lock's keys as a nested constant, each path nested by its segments.
      // FixtureKey is the union of its leaf paths, which readers may use to name a key.
      // Generated from fixtureLock.json on every publish.
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

  test("keeps a segment named after an Object.prototype member as a key of its own, computing __proto__ so it is an own property", () => {
    expect.hasAssertions();

    const source = getHostedAssetKeysSource("Fixture", {
      indexes: {},
      objects: {
        ["__proto__"]: createHostedAssetLockObject("__proto__", HASH),
        "a/constructor": createHostedAssetLockObject("a/constructor", HASH),
        "a/toString": createHostedAssetLockObject("a/toString", HASH),
      },
    });

    expect(source).toMatchInlineSnapshot(`
      "/* oxlint-disable selector-ban/no-restricted-syntax -- a mirror of the lock's own keys, which a reader looks up by a dataset's name at runtime, so a key keeps the spelling the data gives it */
      import type { ValueOfDeep } from "type-fest";

      // The lock's keys as a nested constant, each path nested by its segments.
      // FixtureKey is the union of its leaf paths, which readers may use to name a key.
      // Generated from fixtureLock.json on every publish.
      export const FixtureKeys = {
        ["__proto__"]: "__proto__",
        a: {
          constructor: "a/constructor",
          toString: "a/toString",
        },
      } as const;

      export const FixtureIndexKeys = {

      } as const;

      export type FixtureIndexKey = ValueOfDeep<typeof FixtureIndexKeys>;
      export type FixtureKey = ValueOfDeep<typeof FixtureKeys>;
      export type FixtureKeyOf<D extends keyof typeof FixtureKeys> = ValueOfDeep<(typeof FixtureKeys)[D]>;
      "
    `);
  });

  test("reports a key whose self slot a literal self segment already holds, in either insertion order", () => {
    expect.hasAssertions();

    expect(() =>
      getHostedAssetKeysSource("Fixture", {
        indexes: {},
        objects: Object.fromEntries([
          ["a/self", createHostedAssetLockObject("a/self", HASH)],
          ["a", createHostedAssetLockObject("a", HASH)],
        ]),
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Push, name: a, shares its self slot with a segment named self in the lock]`,
    );
    expect(() =>
      getHostedAssetKeysSource("Fixture", {
        indexes: {},
        objects: { a: createHostedAssetLockObject("a", HASH), "a/self": createHostedAssetLockObject("a/self", HASH) },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Push, name: a/self, shares its self slot with a segment named self in the lock]`,
    );
  });

  test("reports a key whose self slot a literal self segment's branch holds, when that segment leads to a deeper branch", () => {
    expect.hasAssertions();

    expect(() =>
      getHostedAssetKeysSource("Fixture", {
        indexes: {},
        objects: Object.fromEntries([
          ["a/self/x", createHostedAssetLockObject("a/self/x", HASH)],
          ["a", createHostedAssetLockObject("a", HASH)],
        ]),
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Push, name: a, shares its self slot with a segment named self in the lock]`,
    );
  });

  test("reports a key whose self slot a path through a literal self segment would move, when the key comes first", () => {
    expect.hasAssertions();

    expect(() =>
      getHostedAssetKeysSource("Fixture", {
        indexes: {},
        objects: Object.fromEntries([
          ["a", createHostedAssetLockObject("a", HASH)],
          ["a/self/x", createHostedAssetLockObject("a/self/x", HASH)],
        ]),
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Push, name: a/self/x, shares its self slot with a segment named self in the lock]`,
    );
  });
});
