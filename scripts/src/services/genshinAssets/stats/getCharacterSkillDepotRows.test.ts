import type { ExcelSkillDepotRow } from "#src/models/genshinAssets/stats/ExcelSkillDepotRow";
import type { ExcelSkillRow } from "#src/models/genshinAssets/stats/ExcelSkillRow";

import { getCharacterSkillDepotRows } from "#src/services/genshinAssets/stats/getCharacterSkillDepotRows";
import { Element } from "genshin-world";
import { describe, expect, test } from "vitest";

describe(getCharacterSkillDepotRows, () => {
  const TRAVELER_ID = 10_000_007;
  const FIRE_BURST_ID = 1;
  const WIND_BURST_ID = 2;
  const skillMap: ReadonlyMap<number, ExcelSkillRow> = new Map<number, ExcelSkillRow>([
    [
      FIRE_BURST_ID,
      {
        cdTime: 18,
        costElemType: Element.Pyro,
        costElemVal: 70,
        id: FIRE_BURST_ID,
        maxChargeNum: 1,
        nameTextMapHash: 0,
        proudSkillGroupId: 14,
      },
    ],
    [
      WIND_BURST_ID,
      {
        cdTime: 15,
        costElemType: Element.Anemo,
        costElemVal: 60,
        id: WIND_BURST_ID,
        maxChargeNum: 1,
        nameTextMapHash: 0,
        proudSkillGroupId: 15,
      },
    ],
  ]);
  const OWN_DEPOT: ExcelSkillDepotRow = { energySkill: 0, id: 1, LLEFDMDOMGG: [], skills: [], talents: [] };
  const FIRE_DEPOT: ExcelSkillDepotRow = {
    energySkill: FIRE_BURST_ID,
    id: 2,
    LLEFDMDOMGG: [],
    skills: [],
    talents: [],
  };
  const WIND_DEPOT: ExcelSkillDepotRow = {
    energySkill: WIND_BURST_ID,
    id: 3,
    LLEFDMDOMGG: [],
    skills: [],
    talents: [],
  };

  test("takes a Traveler's set of its form element first, ahead of the sets listed before it", () => {
    expect.hasAssertions();

    const skillDepotMap = new Map([OWN_DEPOT, FIRE_DEPOT, WIND_DEPOT].map((depotRow) => [depotRow.id, depotRow]));

    expect(
      getCharacterSkillDepotRows(
        { candSkillDepotIds: [FIRE_DEPOT.id, WIND_DEPOT.id], id: TRAVELER_ID, skillDepotId: OWN_DEPOT.id },
        skillDepotMap,
        skillMap,
      ),
    ).toStrictEqual([WIND_DEPOT, OWN_DEPOT, FIRE_DEPOT]);
  });
});
