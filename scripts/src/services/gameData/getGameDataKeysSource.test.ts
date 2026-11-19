import { getGameDataKeysSource } from "#src/services/gameData/getGameDataKeysSource";
import { describe, expect, test } from "vitest";

describe(getGameDataKeysSource, () => {
  const HASH = "hash";

  test("nests a key by its segments, keeping a key that prefixes others under self and quoting a numeric segment", () => {
    expect.hasAssertions();

    const source = getGameDataKeysSource({
      indexes: { "bookBody/English": HASH },
      objects: { domains: HASH, "domains/weeklyBosses": HASH, "quests/11018": HASH },
    });

    expect(source).toMatchInlineSnapshot(`
      "/* eslint-disable no-restricted-syntax -- a mirror of the lock's own keys, which a reader looks up by a dataset's name at runtime, so a key keeps the spelling the data gives it */
      import type { ValueOfDeep } from "type-fest";

      // The lock's keys as a nested constant, each path nested by its segments.
      // GameDataKey is the union of its leaf paths, which readers may use to name a key.
      // Generated from gameDataLock.json on every publish.
      export const GameDataKeys = {
        domains: {
          self: "domains",
          weeklyBosses: "domains/weeklyBosses",
        },
        quests: {
          "11018": "quests/11018",
        },
      } as const;

      export const GameDataIndexKeys = {
        bookBody: {
          English: "bookBody/English",
        },
      } as const;

      export type GameDataIndexKey = ValueOfDeep<typeof GameDataIndexKeys>;
      export type GameDataKey = ValueOfDeep<typeof GameDataKeys>;
      export type GameDataKeyOf<D extends keyof typeof GameDataKeys> = ValueOfDeep<(typeof GameDataKeys)[D]>;
      "
    `);
  });

  test("keeps a segment named after an Object.prototype member as a key of its own, computing __proto__ so it is an own property", () => {
    expect.hasAssertions();

    const source = getGameDataKeysSource({
      indexes: {},
      objects: { ["__proto__"]: HASH, "a/constructor": HASH, "a/toString": HASH },
    });

    expect(source).toMatchInlineSnapshot(`
      "/* eslint-disable no-restricted-syntax -- a mirror of the lock's own keys, which a reader looks up by a dataset's name at runtime, so a key keeps the spelling the data gives it */
      import type { ValueOfDeep } from "type-fest";

      // The lock's keys as a nested constant, each path nested by its segments.
      // GameDataKey is the union of its leaf paths, which readers may use to name a key.
      // Generated from gameDataLock.json on every publish.
      export const GameDataKeys = {
        ["__proto__"]: "__proto__",
        a: {
          constructor: "a/constructor",
          toString: "a/toString",
        },
      } as const;

      export const GameDataIndexKeys = {

      } as const;

      export type GameDataIndexKey = ValueOfDeep<typeof GameDataIndexKeys>;
      export type GameDataKey = ValueOfDeep<typeof GameDataKeys>;
      export type GameDataKeyOf<D extends keyof typeof GameDataKeys> = ValueOfDeep<(typeof GameDataKeys)[D]>;
      "
    `);
  });

  test("reports a key whose self slot a literal self segment already holds, in either insertion order", () => {
    expect.hasAssertions();

    expect(() =>
      getGameDataKeysSource({
        indexes: {},
        objects: Object.fromEntries([
          ["a/self", HASH],
          ["a", HASH],
        ]),
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Push, name: a, shares its self slot with a segment named self in the lock]`,
    );
    expect(() =>
      getGameDataKeysSource({ indexes: {}, objects: { a: HASH, "a/self": HASH } }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Push, name: a/self, shares its self slot with a segment named self in the lock]`,
    );
  });

  test("reports a key whose self slot a literal self segment's branch holds, when that segment leads to a deeper branch", () => {
    expect.hasAssertions();

    expect(() =>
      getGameDataKeysSource({
        indexes: {},
        objects: Object.fromEntries([
          ["a/self/x", HASH],
          ["a", HASH],
        ]),
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Push, name: a, shares its self slot with a segment named self in the lock]`,
    );
  });
});
