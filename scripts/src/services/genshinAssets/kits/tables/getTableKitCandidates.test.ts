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
});
