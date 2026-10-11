import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { getGcsimKitCandidates } from "#src/services/genshinAssets/kits/gcsim/getGcsimKitCandidates";
import { CombatTalent, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const toConstant = (value: GoValue) => ({ elementLines: {}, file: "skill.go", line: 1, value });

describe(getGcsimKitCandidates, () => {
  test("reads a press's and a hold's hitmarks listed one for each burst state as no hits, the hold still read", () => {
    expect.hasAssertions();

    const gcsim: GcsimCharacter = {
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([
        ["skillHoldFrames", toConstant(80)],
        ["skillHoldHitmarks", toConstant([55, 55])],
        ["skillPressHitmarks", toConstant([32, 33])],
      ]),
      filePaths: [],
      folder: "razor",
      talentFile: "razor.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Razor",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: 0,
        [CombatTalent.ElementalSkill]: 0,
        [CombatTalent.NormalAttack]: 0,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Claymore,
    };
    const candidateMap = getGcsimKitCandidates(gcsim, tables, gcsim);

    expect(
      ["skill.hits.length", "skillHolds.length", "skillHolds.0.action.hits.length"].map((path) =>
        candidateMap.get(path)?.map(({ value }) => value),
      ),
    ).toStrictEqual([undefined, [1], undefined]);
  });
});
