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

    expect(source).toContain(`domains: {\n    self: "domains",\n    weeklyBosses: "domains/weeklyBosses",\n  },`);
    expect(source).toContain(`quests: {\n    "11018": "quests/11018",\n  },`);
    expect(source).toContain(`export type GameDataKeyOf<D extends keyof typeof GameDataKeys>`);
  });

  test("keeps a segment named after an Object.prototype member as a key of its own, quoting __proto__", () => {
    expect.hasAssertions();

    const source = getGameDataKeysSource({
      indexes: {},
      objects: { ["__proto__"]: HASH, "a/constructor": HASH, "a/toString": HASH },
    });

    expect(source).toContain(`a: {\n    constructor: "a/constructor",\n    toString: "a/toString",\n  },`);
    expect(source).toContain(`"__proto__": "__proto__",`);
    expect(Object).not.toHaveProperty("self");
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
      `[InvalidOperationError: Invalid operation: Push, name: a, is listed twice in the lock]`,
    );
    expect(() =>
      getGameDataKeysSource({ indexes: {}, objects: { a: HASH, "a/self": HASH } }),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Push, name: a/self, is listed twice in the lock]`,
    );
  });
});
