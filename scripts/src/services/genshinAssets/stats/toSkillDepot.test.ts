import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";
import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";

import { toSkillDepot } from "#src/services/genshinAssets/stats/toSkillDepot";
import { Element } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(toSkillDepot, () => {
  const DEPOT_ID = 1;
  const SKILL_ID = 2;
  const BURST_ID = 3;
  const ELEMENTLESS_BURST_ID = 4;

  const skillMap: ReadonlyMap<number, ExcelSkillRow> = new Map<number, ExcelSkillRow>([
    [
      BURST_ID,
      { cdTime: 15, costElemType: "Wind", costElemVal: 60, id: BURST_ID, maxChargeNum: 1, nameTextMapHash: 0 },
    ],
    [
      ELEMENTLESS_BURST_ID,
      {
        cdTime: 10,
        costElemType: "None",
        costElemVal: 0,
        id: ELEMENTLESS_BURST_ID,
        maxChargeNum: 1,
        nameTextMapHash: 0,
      },
    ],
    [SKILL_ID, { cdTime: 5, costElemType: "None", costElemVal: 0, id: SKILL_ID, maxChargeNum: 1, nameTextMapHash: 0 }],
  ]);

  test("reads the skill slot and the energy skill, with the burst's element", () => {
    expect.hasAssertions();
    const row: ExcelSkillDepotRow = { energySkill: BURST_ID, id: DEPOT_ID, skills: [0, SKILL_ID, 0, 0] };

    expect(toSkillDepot(row, skillMap)).toStrictEqual({
      burst: { cooldownSeconds: 15, element: Element.Anemo, energyCost: 60 },
      depotId: DEPOT_ID,
      skill: { charges: 1, cooldownSeconds: 5 },
    });
  });

  test("leaves out the burst's element when its energy names none", () => {
    expect.hasAssertions();
    const row: ExcelSkillDepotRow = { energySkill: ELEMENTLESS_BURST_ID, id: DEPOT_ID, skills: [0, 0, 0, 0] };

    expect(toSkillDepot(row, skillMap)).toStrictEqual({
      burst: { cooldownSeconds: 10, energyCost: 0 },
      depotId: DEPOT_ID,
    });
  });

  test("leaves out the burst when the set has no energy skill", () => {
    expect.hasAssertions();
    const row: ExcelSkillDepotRow = { id: DEPOT_ID, skills: [0, SKILL_ID, 0, 0] };

    expect(toSkillDepot(row, skillMap)).toStrictEqual({ depotId: DEPOT_ID, skill: { charges: 1, cooldownSeconds: 5 } });
  });

  test("returns undefined for a set with neither a skill nor a burst", () => {
    expect.hasAssertions();
    const row: ExcelSkillDepotRow = { energySkill: 0, id: DEPOT_ID, skills: [0, 0, 0, 0] };

    expect(toSkillDepot(row, skillMap)).toBeUndefined();
  });
});
