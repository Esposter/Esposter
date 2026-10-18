import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTableLabel } from "#src/models/genshinAssets/kits/tables/KitTableLabel";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { CombatTalent, KitPlunge } from "genshin-world";

const STRIKE_LABEL_REGEX = /^(?<strike>\d+)-Hit DMG$/u;
const SKILL_COOLDOWN_LABELS: ReadonlySet<string> = new Set(["CD", "Press CD", "Skill CD"]);
const HOLD_COOLDOWN_LABEL = "Hold CD";
// A skill's timed duration, as the parameter a kit reads it as under the label its table gives it
const SKILL_DURATION_PARAMETER_NAMES: ReadonlyMap<string, string> = new Map([
  ["Lumi Duration", "lumiDuration"],
  ["Masterstroke", "masterstrokeDuration"],
]);
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

// Every value a character's published tables give its kit, by its path in the record, each as its group and parameter
// Index: the normal attack's labels, `3-Hit DMG` each hit of the third strike in turn, the charged attack's, a spin's
// And its final blow's or a bow's fully charged shot's among them, its stamina's and the plunges', the skill's cooldown
// And its hold's, the skill's named durations, and the burst's cooldown and energy cost
export const getTableKitCandidates = ({ labelMap, talentGroupIdMap }: KitTables): Map<string, KitCandidate[]> => {
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
  for (const tableLabel of labelMap.get(talentGroupIdMap[CombatTalent.ElementalSkill]) ?? []) {
    const durationParameterName = SKILL_DURATION_PARAMETER_NAMES.get(tableLabel.label);
    if (SKILL_COOLDOWN_LABELS.has(tableLabel.label))
      addLabel("skillCooldownSeconds", CombatTalent.ElementalSkill, tableLabel);
    else if (tableLabel.label === HOLD_COOLDOWN_LABEL)
      addLabel("skillHolds.0.cooldownSeconds", CombatTalent.ElementalSkill, tableLabel);
    else if (durationParameterName !== undefined)
      addLabel(`parameters.${durationParameterName}`, CombatTalent.ElementalSkill, tableLabel);
  }
  for (const tableLabel of labelMap.get(talentGroupIdMap[CombatTalent.ElementalBurst]) ?? [])
    if (tableLabel.label === "CD") addLabel("burstCooldownSeconds", CombatTalent.ElementalBurst, tableLabel);
    else if (tableLabel.label === "Energy Cost") addLabel("burstEnergyCost", CombatTalent.ElementalBurst, tableLabel);
  return candidateMap;
};
