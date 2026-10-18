import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitProvisionalCause } from "#src/models/genshinAssets/kits/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { GCSIM_CHARACTERS_PATH } from "#src/services/genshinAssets/kits/constants";
import { getFallbackPlungeKitCandidates } from "#src/services/genshinAssets/kits/gcsim/getFallbackPlungeKitCandidates";
import { CombatTalent, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const plungeConstant = (value: GoValue, line: number) => ({ elementLines: {}, file: "plunge.go", line, value });
const frames = (animationFrames: number) => ({ animationFrames, hitmarkFrames: 0 });

describe(getFallbackPlungeKitCandidates, () => {
  test("gives a character with no gcsim folder the fallback's plunge and collision as NoActionFile, each cited at its file", () => {
    expect.hasAssertions();

    const bennett: GcsimCharacter = {
      animationFrameNameMap: new Map(),
      attacks: [],
      config: { abilityHitboxesMap: new Map(), names: [], talentVariables: [] },
      configFile: "config.yml",
      constantMap: new Map([
        ["lowPlungeFrames", plungeConstant(frames(40), 12)],
        ["lowPlungeHitmark", plungeConstant(30, 13)],
        ["collisionHitmark", plungeConstant(50, 20)],
      ]),
      filePaths: [],
      folder: "bennett",
      queuedAttacks: [],
      talentFile: "bennett.go",
      talentParameterMap: new Map(),
      travelMap: new Map(),
    };
    const tables: KitTables = {
      characterId: 0,
      labelMap: new Map(),
      name: "Nefer",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: 0,
        [CombatTalent.ElementalSkill]: 0,
        [CombatTalent.NormalAttack]: 0,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Catalyst,
    };
    const file = `${GCSIM_CHARACTERS_PATH}/bennett/plunge.go`;
    const noActionFile = { cause: KitProvisionalCause.NoActionFile, file, source: KitSource.Gcsim };

    const candidateMap = getFallbackPlungeKitCandidates(bennett, tables);

    expect({
      collisionHitmark: candidateMap.get("plungeCollision.hitmarkFrames"),
      lowAnimationFrames: candidateMap.get("plunges.low.animationFrames"),
      lowHitCount: candidateMap.get("plunges.low.hits.length"),
      lowHitmark: candidateMap.get("plunges.low.hits.0.hitmarkFrames"),
    }).toStrictEqual({
      collisionHitmark: [{ provenance: { ...noActionFile, line: 20 }, value: 50 }],
      lowAnimationFrames: [{ provenance: { ...noActionFile, line: 12 }, value: 40 }],
      lowHitCount: [
        {
          provenance: { cause: KitProvisionalCause.NoActionFile, rule: KitRule.NoActionFile, source: KitSource.Rule },
          value: 1,
        },
      ],
      lowHitmark: [{ provenance: { ...noActionFile, line: 13 }, value: 30 }],
    });
  });
});
