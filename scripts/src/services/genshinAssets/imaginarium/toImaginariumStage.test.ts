import type { WikiImaginariumStage } from "#src/models/genshinAssets/imaginarium/WikiImaginariumStage";
import type { ImaginariumStageEnemy } from "genshin-world";

import { toImaginariumStage } from "#src/services/genshinAssets/imaginarium/toImaginariumStage";
import { describe, expect, test } from "vitest";

describe(toImaginariumStage, () => {
  const monsters = [
    { describeId: 1001, id: 21030801, name: "Battle-Hardened Samachurl" },
    { describeId: 2002, id: 24020401, name: "Ruin Guard" },
    { describeId: 2003, id: 24020402, name: "Ruin Guard" },
    { describeId: 3004, id: 25010101, name: "Ruin Scout" },
  ];
  const samachurl: ImaginariumStageEnemy = { attack: 1, defense: 1, describeId: 1001, health: 1, monsterId: 21030801 };
  const stage: WikiImaginariumStage = {
    act: "Act 1",
    battle: "Normal",
    easyLevel: 75,
    enemyNames: ["Battle-Hardened Samachurl", "Ruin Guard", "Geovishap (Pyro)", "Ruin Scout"],
    variant: 1,
  };

  test("a stage's names resolve to their codex entries' enemies, and a name whose entries span several, or whose codex names no monster, is listed as refused", () => {
    expect.hasAssertions();

    const toEnemy = (describeId: number): ImaginariumStageEnemy | undefined =>
      describeId === 1001 ? samachurl : undefined;

    expect(toImaginariumStage(stage, 7, monsters, toEnemy)).toStrictEqual({
      act: "Act 1",
      battle: "Normal",
      easyLevel: 75,
      enemies: [samachurl],
      refusals: [
        { count: 2, name: "Ruin Guard", reason: "entries" },
        { count: 0, name: "Geovishap (Pyro)", reason: "entries" },
        { describeId: 3004, name: "Ruin Scout", reason: "codex" },
      ],
      seasonId: 7,
      variant: 1,
    });
  });
});
