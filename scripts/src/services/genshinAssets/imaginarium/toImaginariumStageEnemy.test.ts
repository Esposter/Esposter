import type { MonsterCurveRow } from "#src/models/genshinAssets/enemies/MonsterCurveRow";

import { toLevelCurves } from "#src/services/genshinAssets/enemies/toLevelCurves";
import { toImaginariumStageEnemy } from "#src/services/genshinAssets/imaginarium/toImaginariumStageEnemy";
import { describe, expect, test } from "vitest";

describe(toImaginariumStageEnemy, () => {
  const monsterCurveRows: MonsterCurveRow[] = [
    {
      curveInfos: [
        { GGKIEIJLCJJ: 1, type: "GROW_CURVE_HP_S4" },
        { GGKIEIJLCJJ: 1, type: "GROW_CURVE_ATTACK_S4" },
        { GGKIEIJLCJJ: 1, type: "GROW_CURVE_DEFENSE_S4" },
      ],
      level: 1,
    },
    {
      curveInfos: [
        { GGKIEIJLCJJ: 2.5, type: "GROW_CURVE_HP_S4" },
        { GGKIEIJLCJJ: 2, type: "GROW_CURVE_ATTACK_S4" },
        { GGKIEIJLCJJ: 1.25, type: "GROW_CURVE_DEFENSE_S4" },
      ],
      level: 2,
    },
  ];
  const levelCurves = toLevelCurves(monsterCurveRows);
  const monsterRow = {
    attackBase: 22.608,
    defenseBase: 4,
    describeId: 10101,
    hpBase: 13.584,
    id: 21010101,
    propGrowCurves: [
      { growCurve: "GROW_CURVE_ATTACK_S4", type: "FIGHT_PROP_BASE_ATTACK" },
      { growCurve: "GROW_CURVE_DEFENSE_S4", type: "FIGHT_PROP_BASE_DEFENSE" },
      { growCurve: "GROW_CURVE_HP_S4", type: "FIGHT_PROP_BASE_HP" },
    ],
  };

  test("a stage enemy's stats are its bases times their grow curves at the level, with its monster's describe entry and id", () => {
    expect.hasAssertions();

    expect(toImaginariumStageEnemy(monsterRow, 2, levelCurves)).toStrictEqual({
      attack: 45.216,
      defense: 5,
      describeId: 10101,
      health: 33.96,
      monsterId: 21010101,
    });
  });
});
