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

  test("gives a folder-less character's skill and burst hits the parameters of their labels, hit after hit across labels", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates({
      ...createTables(
        new Map([
          [
            12_239,
            [
              { indexes: [0, 1], label: "1-Hit DMG" },
              { indexes: [2, 3], label: "2-Hit DMG" },
            ],
          ],
          [
            12_232,
            [
              { indexes: [0, 1], label: "Skill DMG" },
              { indexes: [4, 5], label: "Phantasm Performance 1-Hit DMG (Nefer)" },
              { indexes: [6, 7], label: "Phantasm Performance 2-Hit DMG (Nefer)" },
              { indexes: [8], label: "Phantasm Performance 1-Hit DMG (Shades)" },
              { indexes: [9], label: "Phantasm Performance 2-Hit DMG (Shades)" },
              { indexes: [10], label: "Phantasm Performance 3-Hit DMG (Shades)" },
            ],
          ],
        ]),
        { burstGroupId: 12_239, skillGroupId: 12_232 },
      ),
      characterId: 10_000_122,
    });
    expect(readCandidateValues(candidates)).toStrictEqual({
      "burst.hits.0.multiplier": { index: 0, proudSkillGroupId: 12_239 },
      "burst.hits.1.multiplier": { index: 1, proudSkillGroupId: 12_239 },
      "burst.hits.2.multiplier": { index: 2, proudSkillGroupId: 12_239 },
      "burst.hits.3.multiplier": { index: 3, proudSkillGroupId: 12_239 },
      "skill.hits.0.multiplier": { index: 0, proudSkillGroupId: 12_232 },
      "skill.hits.1.multiplier": { index: 1, proudSkillGroupId: 12_232 },
      "stances.phantasmPerformance.chargedAttack.hits.0.multiplier": { index: 4, proudSkillGroupId: 12_232 },
      "stances.phantasmPerformance.chargedAttack.hits.1.multiplier": { index: 5, proudSkillGroupId: 12_232 },
      "stances.phantasmPerformance.chargedAttack.hits.2.multiplier": { index: 6, proudSkillGroupId: 12_232 },
      "stances.phantasmPerformance.chargedAttack.hits.3.multiplier": { index: 7, proudSkillGroupId: 12_232 },
      "stances.phantasmPerformance.chargedAttack.hits.4.multiplier": { index: 8, proudSkillGroupId: 12_232 },
      "stances.phantasmPerformance.chargedAttack.hits.5.multiplier": { index: 9, proudSkillGroupId: 12_232 },
      "stances.phantasmPerformance.chargedAttack.hits.6.multiplier": { index: 10, proudSkillGroupId: 12_232 },
    });
  });

  test("reads Sigewinne's bubble and final bounce healing from her skill's labels, the share and the flat amount at their positions", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates({
      ...createTables(
        new Map([
          [
            12_532,
            [
              { indexes: [0, 1], label: "Bolstering Bubblebalm Healing" },
              { indexes: [2], label: "Final Bounce Healing" },
            ],
          ],
        ]),
        { burstGroupId: 12_539, skillGroupId: 12_532 },
      ),
      characterId: 10_000_095,
    });
    expect(readCandidateValues(candidates)).toStrictEqual({
      "parameters.bolsteringBubblebalmHealingFlat": { index: 1, proudSkillGroupId: 12_532 },
      "parameters.bolsteringBubblebalmHealingShare": { index: 0, proudSkillGroupId: 12_532 },
      "parameters.finalBounceHealingShare": { index: 2, proudSkillGroupId: 12_532 },
    });
  });

  test("gives Vesna's skill its label's multiplier, as the table gives it for her burst", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates({
      ...createTables(
        new Map([
          [14_339, [{ indexes: [0], label: "Spirit Blade DMG" }]],
          [14_332, [{ indexes: [0], label: "Skill DMG" }]],
        ]),
        { burstGroupId: 14_339, skillGroupId: 14_332 },
      ),
      characterId: 10_000_143,
    });
    expect(readCandidateValues(candidates)).toStrictEqual({
      "burst.hits.0.multiplier": { index: 0, proudSkillGroupId: 14_339 },
      "skill.hits.0.multiplier": { index: 0, proudSkillGroupId: 14_332 },
    });
  });

  test("gives Nefer's Phantasm Performance its charged attack's hits, its stamina and the Shadow Dance's seconds from the labels of her talents", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates({
      ...createTables(
        new Map([
          [
            12_232,
            [
              { indexes: [0, 1], label: "Skill DMG" },
              { indexes: [4, 5], label: "Phantasm Performance 1-Hit DMG (Nefer)" },
              { indexes: [6, 7], label: "Phantasm Performance 2-Hit DMG (Nefer)" },
              { indexes: [8], label: "Phantasm Performance 1-Hit DMG (Shades)" },
              { indexes: [9], label: "Phantasm Performance 2-Hit DMG (Shades)" },
              { indexes: [10], label: "Phantasm Performance 3-Hit DMG (Shades)" },
              { indexes: [3], label: "Shadow Dance Duration" },
            ],
          ],
          [12_231, [{ indexes: [10], label: "Shadow Dance Charged Attack Stamina Cost" }]],
          [
            12_239,
            [
              { indexes: [0, 1], label: "1-Hit DMG" },
              { indexes: [2, 3], label: "2-Hit DMG" },
            ],
          ],
        ]),
        { burstGroupId: 12_239, skillGroupId: 12_232 },
      ),
      characterId: 10_000_122,
      talentGroupIdMap: {
        [CombatTalent.ElementalBurst]: 12_239,
        [CombatTalent.ElementalSkill]: 12_232,
        [CombatTalent.NormalAttack]: 12_231,
      },
    });
    const values = readCandidateValues(candidates);
    expect(
      Object.keys(values)
        .filter((path) => path.startsWith("stances.") || path.startsWith("parameters."))
        .toSorted(),
    ).toStrictEqual(
      [
        "stances.phantasmPerformance.chargedAttack.hits.0.multiplier",
        "stances.phantasmPerformance.chargedAttack.hits.1.multiplier",
        "stances.phantasmPerformance.chargedAttack.hits.2.multiplier",
        "stances.phantasmPerformance.chargedAttack.hits.3.multiplier",
        "stances.phantasmPerformance.chargedAttack.hits.4.multiplier",
        "stances.phantasmPerformance.chargedAttack.hits.5.multiplier",
        "stances.phantasmPerformance.chargedAttack.hits.6.multiplier",
        "stances.phantasmPerformance.chargedAttackStamina",
        "parameters.shadowDanceSeconds",
      ].toSorted(),
    );
    expect(values["stances.phantasmPerformance.chargedAttack.hits.6.multiplier"]).toStrictEqual({
      index: 10,
      proudSkillGroupId: 12_232,
    });
    expect(values["stances.phantasmPerformance.chargedAttackStamina"]).toStrictEqual({
      index: 10,
      proudSkillGroupId: 12_231,
    });
    expect(values["parameters.shadowDanceSeconds"]).toStrictEqual({ index: 3, proudSkillGroupId: 12_232 });
  });

  test("gives Zibai's Lunar Phase Shift its skill's Spirit Steed's Stride, its four strikes one by one, its charged attack and its seconds", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates({
      ...createTables(
        new Map([
          [
            12_632,
            [
              { indexes: [5], label: "Lunar Phase Shift 1-Hit DMG" },
              { indexes: [6], label: "Lunar Phase Shift 2-Hit DMG" },
              { indexes: [7, 8], label: "Lunar Phase Shift 3-Hit DMG" },
              { indexes: [9], label: "Lunar Phase Shift 4-Hit DMG" },
              { indexes: [10, 11], label: "Lunar Phase Shift Charged Attack DMG" },
              { indexes: [0], label: "Spirit Steed's Stride 1-Hit DMG" },
              { indexes: [1], label: "Spirit Steed's Stride 2-Hit DMG" },
              { indexes: [3], label: "Lunar Phase Shift Duration" },
            ],
          ],
          [
            12_639,
            [
              { indexes: [0], label: "Skill 1-Hit DMG" },
              { indexes: [1], label: "Skill 2-Hit DMG" },
            ],
          ],
        ]),
        { burstGroupId: 12_639, skillGroupId: 12_632 },
      ),
      characterId: 10_000_126,
    });
    const values = readCandidateValues(candidates);
    expect(
      Object.keys(values)
        .filter((path) => path.startsWith("stances.") || path.startsWith("parameters."))
        .toSorted(),
    ).toStrictEqual(
      [
        "stances.lunarPhaseShift.chargedAttack.hits.0.multiplier",
        "stances.lunarPhaseShift.chargedAttack.hits.1.multiplier",
        "stances.lunarPhaseShift.normalAttacks.0.hits.0.multiplier",
        "stances.lunarPhaseShift.normalAttacks.1.hits.0.multiplier",
        "stances.lunarPhaseShift.normalAttacks.2.hits.0.multiplier",
        "stances.lunarPhaseShift.normalAttacks.2.hits.1.multiplier",
        "stances.lunarPhaseShift.normalAttacks.3.hits.0.multiplier",
        "stances.lunarPhaseShift.skill.hits.0.multiplier",
        "stances.lunarPhaseShift.skill.hits.1.multiplier",
        "parameters.lunarPhaseShiftSeconds",
      ].toSorted(),
    );
    expect(values["stances.lunarPhaseShift.normalAttacks.2.hits.1.multiplier"]).toStrictEqual({
      index: 8,
      proudSkillGroupId: 12_632,
    });
    expect(values["stances.lunarPhaseShift.skill.hits.1.multiplier"]).toStrictEqual({
      index: 1,
      proudSkillGroupId: 12_632,
    });
  });

  test("gives Illuga's skill hold its hits from the Hold DMG label, and its cooldown from the skill's CD", () => {
    expect.hasAssertions();
    const candidates = getTableKitCandidates({
      ...createTables(
        new Map([
          [
            12_732,
            [
              { indexes: [0, 1], label: "Press DMG" },
              { indexes: [2, 3], label: "Hold DMG" },
              { indexes: [4], label: "CD" },
            ],
          ],
          [12_739, [{ indexes: [0, 1], label: "Skill DMG" }]],
        ]),
        { burstGroupId: 12_739, skillGroupId: 12_732 },
      ),
      characterId: 10_000_127,
    });
    const values = readCandidateValues(candidates);
    expect(values["skillHolds.0.action.hits.0.multiplier"]).toStrictEqual({ index: 2, proudSkillGroupId: 12_732 });
    expect(values["skillHolds.0.action.hits.1.multiplier"]).toStrictEqual({ index: 3, proudSkillGroupId: 12_732 });
    expect(values["skillHolds.0.cooldownSeconds"]).toStrictEqual({ index: 4, proudSkillGroupId: 12_732 });
  });
});
