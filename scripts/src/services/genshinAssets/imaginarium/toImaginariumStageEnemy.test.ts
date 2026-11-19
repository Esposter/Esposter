import type { MonsterCurveRow } from "#src/models/genshinAssets/enemies/MonsterCurveRow";

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

  test("a stage enemy's health at a level equals its base times the health curve at that level", () => {
    expect.hasAssertions();

    expect(toImaginariumStageEnemy(monsterRow, 2, monsterCurveRows).health).toBeCloseTo(13.584 * 2.5);
  });

  test("a stage enemy's attack and defense at a level equal their bases times their curves at that level", () => {
    expect.hasAssertions();

    const { attack, defense } = toImaginariumStageEnemy(monsterRow, 2, monsterCurveRows);

    expect(attack).toBeCloseTo(22.608 * 2);
    expect(defense).toBeCloseTo(4 * 1.25);
  });

  test("a stage enemy is the monster its describe entry resolves to", () => {
    expect.hasAssertions();

    expect(toImaginariumStageEnemy(monsterRow, 2, monsterCurveRows)).toMatchObject({
      describeId: 10101,
      monsterId: 21010101,
    });
  });
});
