import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTableLabel } from "#src/models/genshinAssets/kits/tables/KitTableLabel";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { getTableKitCandidates } from "#src/services/genshinAssets/kits/tables/getTableKitCandidates";
import { CombatTalent, WeaponType } from "genshin-world";
import { describe, expect, test } from "vitest";

const LINNEA_BURST_GROUP_ID = 13_039;
const LINNEA_SKILL_GROUP_ID = 13_032;
const LOHEN_BURST_GROUP_ID = 12_939;
const LOHEN_SKILL_GROUP_ID = 12_932;

const BURST_GROUP_ID = 12_239;
const SKILL_GROUP_ID = 12_232;

const CLORINDE_NAME = "Clorinde";
const CLORINDE_CHARACTER_ID = 10_000_098;
const NORMAL_ATTACK_GROUP_ID = 9831;
const ELEMENTAL_SKILL_GROUP_ID = 9832;
const ELEMENTAL_BURST_GROUP_ID = 9839;

// Clorinde's elemental skill rows as her table gives them, with the parameter indexes each reads
const CLORINDE_SKILL_LABELS = [
  { indexes: [2], label: "Swift Hunt Bond of Life Gain" },
  { indexes: [5, 7], label: "Impale the Night Healing" },
  { indexes: [8], label: "Bond of Life Conversion" },
  { indexes: [11], label: "Night Vigil Duration" },
];

const createCharacterTables = (name: string, characterId: number): KitTables => ({
  characterId,
  labelMap: new Map([[ELEMENTAL_SKILL_GROUP_ID, CLORINDE_SKILL_LABELS]]),
  name,
  talentGroupIdMap: {
    [CombatTalent.ElementalBurst]: ELEMENTAL_BURST_GROUP_ID,
    [CombatTalent.ElementalSkill]: ELEMENTAL_SKILL_GROUP_ID,
    [CombatTalent.NormalAttack]: NORMAL_ATTACK_GROUP_ID,
  },
  talentMultiplierMap: {},
  weaponType: WeaponType.Sword,
});

const createTables = (
  labelMap: Map<number, KitTableLabel[]>,
  { burstGroupId, skillGroupId }: { burstGroupId: number; skillGroupId: number },
): KitTables => ({
  characterId: 10_000_130,
  labelMap,
  name: "Test",
  talentGroupIdMap: {
    [CombatTalent.ElementalBurst]: burstGroupId,
    [CombatTalent.ElementalSkill]: skillGroupId,
    [CombatTalent.NormalAttack]: 0,
  },
  talentMultiplierMap: {},
  weaponType: WeaponType.Catalyst,
});

// The first candidate's value of each path, the way the builder's record reads the candidates it chooses by default
const readCandidateValues = (candidates: Map<string, KitCandidate[]>) =>
  Object.fromEntries([...candidates].map(([path, [candidate]]) => [path, candidate?.value]));

describe(getTableKitCandidates, () => {
  test("reads the skill's Lumi Duration as the lumi duration parameter, at its index in the skill group", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates(
      createTables(
        new Map([
          [
            LINNEA_SKILL_GROUP_ID,
            [
              { indexes: [4], label: "CD" },
              { indexes: [3], label: "Lumi Duration" },
            ],
          ],
        ]),
        { burstGroupId: LINNEA_BURST_GROUP_ID, skillGroupId: LINNEA_SKILL_GROUP_ID },
      ),
    );
    expect(candidates.get("parameters.lumiDuration")).toStrictEqual([
      {
        provenance: {
          index: 3,
          label: "Lumi Duration",
          proudSkillGroupId: LINNEA_SKILL_GROUP_ID,
          source: KitSource.Tables,
        },
        value: { index: 3, proudSkillGroupId: LINNEA_SKILL_GROUP_ID },
      },
    ]);
  });

  test("reads the skill's Masterstroke duration as the masterstroke duration parameter, at its index in the skill group", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates(
      createTables(new Map([[LOHEN_SKILL_GROUP_ID, [{ indexes: [11], label: "Masterstroke" }]]]), {
        burstGroupId: LOHEN_BURST_GROUP_ID,
        skillGroupId: LOHEN_SKILL_GROUP_ID,
      }),
    );
    expect(candidates.get("parameters.masterstrokeDuration")).toStrictEqual([
      {
        provenance: {
          index: 11,
          label: "Masterstroke",
          proudSkillGroupId: LOHEN_SKILL_GROUP_ID,
          source: KitSource.Tables,
        },
        value: { index: 11, proudSkillGroupId: LOHEN_SKILL_GROUP_ID },
      },
    ]);
  });

  test("reads Etched Into Bone and Soul's four hits as a named list of hits, each the skill's multiplier at its index", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates(
      createTables(
        new Map([[LOHEN_SKILL_GROUP_ID, [{ indexes: [16, 16, 16, 16], label: "Etched Into Bone and Soul DMG" }]]]),
        { burstGroupId: LOHEN_BURST_GROUP_ID, skillGroupId: LOHEN_SKILL_GROUP_ID },
      ),
    );
    expect(readCandidateValues(candidates)).toStrictEqual({
      "hits.etchedIntoBoneAndSoul.0.multiplier": { index: 16, proudSkillGroupId: LOHEN_SKILL_GROUP_ID },
      "hits.etchedIntoBoneAndSoul.1.multiplier": { index: 16, proudSkillGroupId: LOHEN_SKILL_GROUP_ID },
      "hits.etchedIntoBoneAndSoul.2.multiplier": { index: 16, proudSkillGroupId: LOHEN_SKILL_GROUP_ID },
      "hits.etchedIntoBoneAndSoul.3.multiplier": { index: 16, proudSkillGroupId: LOHEN_SKILL_GROUP_ID },
      "hits.etchedIntoBoneAndSoul.length": 4,
    });
  });

  test("reads the count of Etched Into Bone and Soul's hits as the named list's length, the count its label repeats", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates(
      createTables(
        new Map([[LOHEN_SKILL_GROUP_ID, [{ indexes: [16, 16, 16, 16], label: "Etched Into Bone and Soul DMG" }]]]),
        { burstGroupId: LOHEN_BURST_GROUP_ID, skillGroupId: LOHEN_SKILL_GROUP_ID },
      ),
    );
    expect(candidates.get("hits.etchedIntoBoneAndSoul.length")).toStrictEqual([
      {
        provenance: {
          index: 16,
          label: "Etched Into Bone and Soul DMG",
          proudSkillGroupId: LOHEN_SKILL_GROUP_ID,
          source: KitSource.Tables,
        },
        value: 4,
      },
    ]);
  });

  test("reads Linnea's healing as the heal's parameters, each at its index in the burst group", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates(
      createTables(
        new Map([
          [
            LINNEA_BURST_GROUP_ID,
            [
              { indexes: [1, 0], label: "Initial Healing Amount" },
              { indexes: [3, 2], label: "Continuous Healing" },
              { indexes: [4], label: "Healing Duration" },
            ],
          ],
        ]),
        { burstGroupId: LINNEA_BURST_GROUP_ID, skillGroupId: LINNEA_SKILL_GROUP_ID },
      ),
    );
    expect(readCandidateValues(candidates)).toStrictEqual({
      "parameters.burstContinuousHealDefenseShare": { index: 3, proudSkillGroupId: LINNEA_BURST_GROUP_ID },
      "parameters.burstContinuousHealFlat": { index: 2, proudSkillGroupId: LINNEA_BURST_GROUP_ID },
      "parameters.burstHealingDuration": { index: 4, proudSkillGroupId: LINNEA_BURST_GROUP_ID },
      "parameters.burstInitialHealDefenseShare": { index: 1, proudSkillGroupId: LINNEA_BURST_GROUP_ID },
      "parameters.burstInitialHealFlat": { index: 0, proudSkillGroupId: LINNEA_BURST_GROUP_ID },
    });
  });

  test("reads Lumi's Pound-Pound and Heavy Overdrive hits on the skill and Million Ton Crush on its chain's follow-up", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates(
      createTables(
        new Map([
          [
            LINNEA_SKILL_GROUP_ID,
            [
              { indexes: [0, 0], label: "Lumi Pound-Pound Pummeler DMG" },
              { indexes: [1], label: "Lumi Heavy Overdrive Hammer DMG" },
              { indexes: [2], label: "Lumi Million Ton Crush DMG" },
            ],
          ],
        ]),
        { burstGroupId: LINNEA_BURST_GROUP_ID, skillGroupId: LINNEA_SKILL_GROUP_ID },
      ),
    );
    expect(readCandidateValues(candidates)).toStrictEqual({
      "skill.hits.0.multiplier": { index: 0, proudSkillGroupId: LINNEA_SKILL_GROUP_ID },
      "skill.hits.1.multiplier": { index: 0, proudSkillGroupId: LINNEA_SKILL_GROUP_ID },
      "skill.hits.2.multiplier": { index: 1, proudSkillGroupId: LINNEA_SKILL_GROUP_ID },
      "skillChain.followUps.0.hits.0.multiplier": { index: 2, proudSkillGroupId: LINNEA_SKILL_GROUP_ID },
    });
  });

  test("reads Will to Win's damage per point from the skill for Etched Into Bone and Soul, and from the burst for Manifest Judgment", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates(
      createTables(
        new Map([
          [LOHEN_SKILL_GROUP_ID, [{ indexes: [17], label: "DMG Increase From Will to Win" }]],
          [LOHEN_BURST_GROUP_ID, [{ indexes: [1], label: "DMG Increase From Will to Win" }]],
        ]),
        { burstGroupId: LOHEN_BURST_GROUP_ID, skillGroupId: LOHEN_SKILL_GROUP_ID },
      ),
    );
    expect(readCandidateValues(candidates)).toStrictEqual({
      "parameters.etchedWillToWinDamagePerPoint": { index: 17, proudSkillGroupId: LOHEN_SKILL_GROUP_ID },
      "parameters.manifestJudgmentWillToWinDamagePerPoint": { index: 1, proudSkillGroupId: LOHEN_BURST_GROUP_ID },
    });
  });

  test("the Night Vigil duration is read from Clorinde's elemental skill row, at the row's own index", () => {
    expect.hasAssertions();

    const candidateMap = getTableKitCandidates(createCharacterTables(CLORINDE_NAME, CLORINDE_CHARACTER_ID));

    expect(candidateMap.get("parameters.nightVigilSeconds")).toStrictEqual([
      {
        provenance: {
          index: 11,
          label: "Night Vigil Duration",
          proudSkillGroupId: ELEMENTAL_SKILL_GROUP_ID,
          source: KitSource.Tables,
        },
        value: { index: 11, proudSkillGroupId: ELEMENTAL_SKILL_GROUP_ID },
      },
    ]);
  });

  test("the Impale the Night healing's two parameters are the low and full Bond of Life rows, each at its own index", () => {
    expect.hasAssertions();

    const candidateMap = getTableKitCandidates(createCharacterTables(CLORINDE_NAME, CLORINDE_CHARACTER_ID));

    expect({
      full: candidateMap.get("parameters.impaleTheNightFullBondOfLifeHealing")?.[0]?.value,
      low: candidateMap.get("parameters.impaleTheNightLowBondOfLifeHealing")?.[0]?.value,
    }).toStrictEqual({
      full: { index: 7, proudSkillGroupId: ELEMENTAL_SKILL_GROUP_ID },
      low: { index: 5, proudSkillGroupId: ELEMENTAL_SKILL_GROUP_ID },
    });
  });

  test("a character with no mapping of its own reads none of the same labels as parameters", () => {
    expect.hasAssertions();

    const candidateMap = getTableKitCandidates(createCharacterTables("Amber", 10_000_021));

    expect([...candidateMap.keys()].filter((path) => path.startsWith("parameters."))).toStrictEqual([]);
  });

  test("gives a folder-less character's skill and burst hits the parameters of their labels, hit after hit across labels", () => {
    expect.hasAssertions();

    const tables: KitTables = {
      characterId: 10_000_122,
      labelMap: new Map([
        [
          BURST_GROUP_ID,
          [
            { indexes: [0, 1], label: "1-Hit DMG" },
            { indexes: [2, 3], label: "2-Hit DMG" },
          ],
        ],
        [SKILL_GROUP_ID, [{ indexes: [0, 1], label: "Skill DMG" }]],
      ]),
      name: "Nefer",
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: BURST_GROUP_ID,
        [CombatTalent.ElementalSkill]: SKILL_GROUP_ID,
        [CombatTalent.NormalAttack]: 12_231,
      },
      talentMultiplierMap: {},
      weaponType: WeaponType.Catalyst,
    };
    const candidateMap = getTableKitCandidates(tables);

    expect([...candidateMap.keys()]).toStrictEqual([
      "burst.hits.0.multiplier",
      "burst.hits.1.multiplier",
      "burst.hits.2.multiplier",
      "burst.hits.3.multiplier",
      "skill.hits.0.multiplier",
      "skill.hits.1.multiplier",
    ]);
    expect(candidateMap.get("burst.hits.2.multiplier")).toStrictEqual([
      {
        provenance: { index: 2, label: "2-Hit DMG", proudSkillGroupId: BURST_GROUP_ID, source: KitSource.Tables },
        value: { index: 2, proudSkillGroupId: BURST_GROUP_ID },
      },
    ]);
  });
});
