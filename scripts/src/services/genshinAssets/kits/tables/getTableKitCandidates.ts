import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTableLabel } from "#src/models/genshinAssets/kits/tables/KitTableLabel";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { CombatTalent, KitPlunge } from "genshin-world";

const STRIKE_LABEL_REGEX = /^(?<strike>\d+)-Hit DMG$/u;
const SKILL_COOLDOWN_LABELS: ReadonlySet<string> = new Set(["CD", "Press CD", "Skill CD"]);
const HOLD_COOLDOWN_LABEL = "Hold CD";
const CHARGED_ATTACK_LABELS: ReadonlySet<string> = new Set(["Charged Attack", "Charged Attack DMG"]);
// A claymore's spin, each of its hits the first hit of the charged attack and its final blow the second
const CHARGED_ATTACK_CYCLIC_LABELS: ReadonlySet<string> = new Set([
  "Charged Attack Cyclic DMG",
  "Charged Attack Spinning DMG",
]);
const CHARGED_ATTACK_FINAL_LABEL = "Charged Attack Final DMG";
// A bow's fully charged aimed shot, which its charged attack is
const FULLY_CHARGED_AIMED_SHOT_LABELS: ReadonlySet<string> = new Set([
  "Aimed Shot Charge Level 1",
  "Fully-Charged Aimed Shot",
]);
// The hit paths a skill's labelled multipliers give their values to, by each value's position in its label: a named list
// Of the hits a module spawns, or a hit of the skill, or of its chain's follow-up
const ETCHED_INTO_BONE_AND_SOUL_HIT_PATHS = [0, 1, 2, 3].map((position) => `hits.etchedIntoBoneAndSoul.${position}`);
const SKILL_HIT_PATHS: ReadonlyMap<string, readonly string[]> = new Map([
  ["Etched Into Bone and Soul DMG", ETCHED_INTO_BONE_AND_SOUL_HIT_PATHS],
  ["Lumi Heavy Overdrive Hammer DMG", ["skill.hits.2"]],
  ["Lumi Million Ton Crush DMG", ["skillChain.followUps.0.hits.0"]],
  ["Lumi Pound-Pound Pummeler DMG", ["skill.hits.0", "skill.hits.1"]],
]);
// The length of a named list of hits a skill's label gives, which is the count its label repeats
const NAMED_HIT_LIST_LENGTH_PATHS: ReadonlyMap<string, string> = new Map([
  ["Etched Into Bone and Soul DMG", "hits.etchedIntoBoneAndSoul.length"],
]);
// The parameters a skill's labels read, by each value's position in its label, the way the kit reads them
const SKILL_PARAMETER_NAMES: ReadonlyMap<string, readonly string[]> = new Map([
  ["DMG Increase From Will to Win", ["etchedWillToWinDamagePerPoint"]],
  ["Lumi Duration", ["lumiDuration"]],
  ["Masterstroke", ["masterstrokeDuration"]],
]);
// The parameters a burst's labels read, the healing's share of DEF and its flat amount in the order its label gives them
const BURST_PARAMETER_NAMES: ReadonlyMap<string, readonly string[]> = new Map([
  ["Continuous Healing", ["burstContinuousHealDefenseShare", "burstContinuousHealFlat"]],
  ["DMG Increase From Will to Win", ["manifestJudgmentWillToWinDamagePerPoint"]],
  ["Healing Duration", ["burstHealingDuration"]],
  ["Initial Healing Amount", ["burstInitialHealDefenseShare", "burstInitialHealFlat"]],
]);

// A character's own elemental skill rows, each read onto the parameters its module reads by name. A row's parameters are
// Taken in order, one name to each, so Impale the Night Healing's low and full heals are its first and second parameters
const CHARACTER_SKILL_PARAMETER_NAME_MAP: Readonly<Record<string, Readonly<Record<string, readonly string[]>>>> = {
  Clorinde: {
    "Bond of Life Conversion": ["bondOfLifeConversionHealing"],
    "Impale the Night Healing": ["impaleTheNightLowBondOfLifeHealing", "impaleTheNightFullBondOfLifeHealing"],
    "Night Vigil Duration": ["nightVigilSeconds"],
    "Swift Hunt Bond of Life Gain": ["swiftHuntBondOfLifeGain"],
  },
  // Sigewinne's bubbles' healing and the final bounce's heal, each at its position in the label
  Sigewinne: {
    "Bolstering Bubblebalm Healing": ["bolsteringBubblebalmHealingShare", "bolsteringBubblebalmHealingFlat"],
    "Final Bounce Healing": ["finalBounceHealingShare"],
  },
};

// Every value a character's published tables give its kit, by its path in the record, each as its group and parameter
// Index: the normal attack's labels, `3-Hit DMG` each hit of the third strike in turn, the charged attack's, a spin's
// And its final blow's or a bow's fully charged shot's among them, its stamina's and the plunges', the skill's cooldown
// And its hold's, the skill's hits and named durations, and the burst's cooldown, energy cost and healing, and a
// Character's own skill rows its module reads by name
export const getTableKitCandidates = ({ labelMap, name, talentGroupIdMap }: KitTables): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  const addLabel = (path: string, combatTalent: CombatTalent, { indexes, label }: KitTableLabel, position = 0) => {
    const proudSkillGroupId = talentGroupIdMap[combatTalent];
    const index = indexes[position];
    if (index !== undefined)
      addKitCandidate(candidateMap, path, {
        provenance: { index, label, proudSkillGroupId, source: KitSource.Tables },
        value: { index, proudSkillGroupId },
      });
  };
  const addHits = (path: string, combatTalent: CombatTalent, tableLabel: KitTableLabel) => {
    for (const position of tableLabel.indexes.keys())
      addLabel(`${path}.hits.${position}.multiplier`, combatTalent, tableLabel, position);
  };
  const addLength = (path: string, combatTalent: CombatTalent, { indexes, label }: KitTableLabel) => {
    const index = indexes[0];
    if (index !== undefined)
      addKitCandidate(candidateMap, path, {
        provenance: { index, label, proudSkillGroupId: talentGroupIdMap[combatTalent], source: KitSource.Tables },
        value: indexes.length,
      });
  };
  const addHitLabel = (hitPaths: readonly string[], combatTalent: CombatTalent, tableLabel: KitTableLabel) => {
    for (const [position, hitPath] of hitPaths.entries())
      if (position < tableLabel.indexes.length) addLabel(`${hitPath}.multiplier`, combatTalent, tableLabel, position);
  };
  const addParameterLabel = (names: readonly string[], combatTalent: CombatTalent, tableLabel: KitTableLabel) => {
    for (const [position, name] of names.entries()) addLabel(`parameters.${name}`, combatTalent, tableLabel, position);
  };
  const normalAttackLabels = labelMap.get(talentGroupIdMap[CombatTalent.NormalAttack]) ?? [];
  const hasChargedAttackCycle = normalAttackLabels.some(({ label }) => CHARGED_ATTACK_CYCLIC_LABELS.has(label));
  for (const tableLabel of normalAttackLabels) {
    const strike = STRIKE_LABEL_REGEX.exec(tableLabel.label)?.groups?.strike;
    if (strike !== undefined) addHits(`normalAttacks.${Number(strike) - 1}`, CombatTalent.NormalAttack, tableLabel);
    else if (CHARGED_ATTACK_LABELS.has(tableLabel.label))
      addHits("chargedAttack", CombatTalent.NormalAttack, tableLabel);
    else if (
      CHARGED_ATTACK_CYCLIC_LABELS.has(tableLabel.label) ||
      FULLY_CHARGED_AIMED_SHOT_LABELS.has(tableLabel.label)
    )
      addLabel("chargedAttack.hits.0.multiplier", CombatTalent.NormalAttack, tableLabel);
    else if (tableLabel.label === CHARGED_ATTACK_FINAL_LABEL)
      addLabel(`chargedAttack.hits.${hasChargedAttackCycle ? 1 : 0}.multiplier`, CombatTalent.NormalAttack, tableLabel);
    else if (tableLabel.label === "Charged Attack Stamina Cost")
      addLabel("chargedAttackStamina", CombatTalent.NormalAttack, tableLabel);
    else if (tableLabel.label === "Plunge DMG")
      addLabel("plungeCollision.multiplier", CombatTalent.NormalAttack, tableLabel);
    else if (tableLabel.label === "Low/High Plunge DMG") {
      addLabel(`plunges.${KitPlunge.Low}.hits.0.multiplier`, CombatTalent.NormalAttack, tableLabel, 0);
      addLabel(`plunges.${KitPlunge.High}.hits.0.multiplier`, CombatTalent.NormalAttack, tableLabel, 1);
    }
  }
  const characterSkillParameterNameMap = CHARACTER_SKILL_PARAMETER_NAME_MAP[name] ?? {};
  for (const tableLabel of labelMap.get(talentGroupIdMap[CombatTalent.ElementalSkill]) ?? []) {
    const hitPaths = SKILL_HIT_PATHS.get(tableLabel.label);
    const parameterNames = SKILL_PARAMETER_NAMES.get(tableLabel.label);
    if (SKILL_COOLDOWN_LABELS.has(tableLabel.label))
      addLabel("skillCooldownSeconds", CombatTalent.ElementalSkill, tableLabel);
    else if (tableLabel.label === HOLD_COOLDOWN_LABEL)
      addLabel("skillHolds.0.cooldownSeconds", CombatTalent.ElementalSkill, tableLabel);
    else if (hitPaths !== undefined) {
      addHitLabel(hitPaths, CombatTalent.ElementalSkill, tableLabel);
      const listLengthPath = NAMED_HIT_LIST_LENGTH_PATHS.get(tableLabel.label);
      if (listLengthPath !== undefined) addLength(listLengthPath, CombatTalent.ElementalSkill, tableLabel);
    } else if (parameterNames !== undefined) addParameterLabel(parameterNames, CombatTalent.ElementalSkill, tableLabel);
    else
      for (const [position, parameterName] of (characterSkillParameterNameMap[tableLabel.label] ?? []).entries())
        addLabel(`parameters.${parameterName}`, CombatTalent.ElementalSkill, tableLabel, position);
  }
  for (const tableLabel of labelMap.get(talentGroupIdMap[CombatTalent.ElementalBurst]) ?? []) {
    const parameterNames = BURST_PARAMETER_NAMES.get(tableLabel.label);
    if (tableLabel.label === "CD") addLabel("burstCooldownSeconds", CombatTalent.ElementalBurst, tableLabel);
    else if (tableLabel.label === "Energy Cost") addLabel("burstEnergyCost", CombatTalent.ElementalBurst, tableLabel);
    else if (parameterNames !== undefined) addParameterLabel(parameterNames, CombatTalent.ElementalBurst, tableLabel);
  }
  return candidateMap;
};
