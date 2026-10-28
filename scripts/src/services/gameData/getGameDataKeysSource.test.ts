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
});
