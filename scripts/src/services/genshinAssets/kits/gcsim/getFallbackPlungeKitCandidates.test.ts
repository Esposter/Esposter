import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GcsimConfig } from "#src/models/genshinAssets/kits/gcsim/GcsimConfig";
import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { KitProvisionalCause } from "#src/models/shared/KitProvisionalCause";
import { KitRule } from "#src/models/genshinAssets/kits/KitRule";
import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { GCSIM_CHARACTERS_PATH } from "#src/services/genshinAssets/kits/constants";
import { createCircleReach } from "#src/services/genshinAssets/kits/gcsim/createCircleReach";
import { getFallbackPlungeKitCandidates } from "#src/services/genshinAssets/kits/gcsim/getFallbackPlungeKitCandidates";
import { CombatTalent, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const plungeConstant = (value: GoValue, line: number) => ({ elementLines: {}, file: "plunge.go", line, value });
const frames = (animationFrames: number) => ({ animationFrames, hitmarkFrames: 0 });

const createBennett = (abilityHitboxesMap: GcsimConfig["abilityHitboxesMap"] = new Map()): GcsimCharacter => ({
  animationFrameNameMap: new Map(),
  attacks: [],
  config: { abilityHitboxesMap, names: [], talentVariables: [] },
  configFile: "config.yml",
  constantMap: new Map([
    ["collisionHitmark", plungeConstant(50, 20)],
    ["lowPlungeFrames", plungeConstant(frames(40), 12)],
    ["lowPlungeHitmark", plungeConstant(30, 13)],
  ]),
  filePaths: [],
  folder: "bennett",
  goSources: [],
  holdCooldowns: [],
  queuedAttacks: [],
  talentArrayMap: new Map(),
  talentFile: "bennett.go",
  talentParameterMap: new Map(),
  travelMap: new Map(),
});

describe(getFallbackPlungeKitCandidates, () => {
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

  test("gives a character with no gcsim folder the fallback's plunge and collision as NoActionFile, each cited at its file", () => {
    expect.hasAssertions();

    const file = `${GCSIM_CHARACTERS_PATH}/bennett/plunge.go`;
    const noActionFile = { cause: KitProvisionalCause.NoActionFile, file, source: KitSource.Gcsim };

    const candidateMap = getFallbackPlungeKitCandidates(createBennett(), tables);

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

  test("prices a borrowed plunge's areas as the fallback character's own build does, its forward offset counted", () => {
    expect.hasAssertions();

    const bennett = createBennett(
      new Map([
        [
          "plunge",
          [
            {
              center: GcsimHitboxCenter.Player,
              line: 5,
              name: "Low_Plunge",
              offset: [0, 1],
              radius: 3,
              shape: GcsimHitboxShape.Circle,
            },
            {
              center: GcsimHitboxCenter.Player,
              line: 6,
              name: "Plunge",
              offset: [0, 1],
              radius: 1,
              shape: GcsimHitboxShape.Circle,
            },
          ],
        ],
      ]),
    );
    const noActionFile = {
      cause: KitProvisionalCause.NoActionFile,
      file: `${GCSIM_CHARACTERS_PATH}/bennett/config.yml`,
      source: KitSource.Gcsim,
    };

    const candidateMap = getFallbackPlungeKitCandidates(bennett, tables);

    expect({
      collisionArea: candidateMap.get("plungeCollision.area"),
      lowArea: candidateMap.get("plunges.low.hits.0.area"),
    }).toStrictEqual({
      collisionArea: [{ provenance: { ...noActionFile, line: 6 }, value: createCircleReach(1, 1) }],
      lowArea: [{ provenance: { ...noActionFile, line: 5 }, value: createCircleReach(1, 3) }],
    });
  });
});
