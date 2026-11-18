import type { WikiImaginariumStage } from "#src/models/genshinAssets/imaginarium/WikiImaginariumStage";

import { toImaginariumStage } from "#src/services/genshinAssets/imaginarium/toImaginariumStage";
import { describe, expect, test } from "vitest";

describe(toImaginariumStage, () => {
  const monsters = [
    { describeId: 1001, id: 21030801, name: "Battle-Hardened Samachurl" },
    { describeId: 2002, id: 24020401, name: "Ruin Guard" },
    { describeId: 2003, id: 24020402, name: "Ruin Guard" },
  ];
  const stage: WikiImaginariumStage = {
    act: "Act 1",
    battle: "Normal",
    easyLevel: 75,
    enemyNames: ["Battle-Hardened Samachurl", "Ruin Guard", "Geovishap (Pyro)"],
    variant: 1,
  };

  test("a stage's names resolve to their describe entries, and a name held by several entries or none is listed as refused", () => {
    expect.hasAssertions();

    expect(toImaginariumStage(stage, 7, monsters)).toStrictEqual({
      act: "Act 1",
      battle: "Normal",
      describeIds: [1001],
      easyLevel: 75,
      refusals: [
        { count: 2, name: "Ruin Guard" },
        { count: 0, name: "Geovishap (Pyro)" },
      ],
      seasonId: 7,
      variant: 1,
    });
  });
});
