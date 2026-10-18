import { CombatTalent } from "genshin-world";

const BURST = CombatTalent.ElementalBurst;
const NORMAL_ATTACK = CombatTalent.NormalAttack;
const SKILL = CombatTalent.ElementalSkill;

// The hit slot of a folder-less character's record a path names, the talent its labels sit in, and the labels its hits
// Read their multipliers from, in hit order. A label spanning several hits gives one to each of its parameters
interface KitSlotHitLabels {
  combatTalent: CombatTalent;
  labels: readonly string[];
}

// The value of a folder-less character's record a path names, the talent and label it reads, and the position in the
// Label's parameters that names it, the first where none is given
interface KitSlotValueLabel {
  combatTalent: CombatTalent;
  label: string;
  position?: number;
}

// The labels a folder-less character's record reads from its tables, by each slot's path in the record: the hit slots
// And the other values, such as a stance's stamina or a duration
interface KitSlotLabels {
  hits?: Record<string, KitSlotHitLabels>;
  values?: Record<string, KitSlotValueLabel>;
}

// The labels of each folder-less character, keyed by its avatar id. Nefer's Phantasm Performance replaces her charged
// Attack while Shadow Dance holds, and Zibai's Lunar Phase Shift replaces her strikes, charged attack and Spirit Steed's
// Stride while it holds, each stance read from its skill's labels. Illuga's Hold is his skill's hold, read from its Hold
// DMG label. Vesna's skill tag is the wiki's, so her skill reads its label here like her burst
export const characterIdSlotHitLabelsMap: ReadonlyMap<number, KitSlotLabels> = new Map<number, KitSlotLabels>([
  // Nefer
  [
    10_000_122,
    {
      hits: {
        burst: { combatTalent: BURST, labels: ["1-Hit DMG", "2-Hit DMG"] },
        "stances.phantasmPerformance.chargedAttack": {
          combatTalent: SKILL,
          labels: [
            "Phantasm Performance 1-Hit DMG (Nefer)",
            "Phantasm Performance 2-Hit DMG (Nefer)",
            "Phantasm Performance 1-Hit DMG (Shades)",
            "Phantasm Performance 2-Hit DMG (Shades)",
            "Phantasm Performance 3-Hit DMG (Shades)",
          ],
        },
        skill: { combatTalent: SKILL, labels: ["Skill DMG"] },
      },
      values: {
        "parameters.shadowDanceSeconds": { combatTalent: SKILL, label: "Shadow Dance Duration" },
        "stances.phantasmPerformance.chargedAttackStamina": {
          combatTalent: NORMAL_ATTACK,
          label: "Shadow Dance Charged Attack Stamina Cost",
        },
      },
    },
  ],
  // Zibai. Her fourth strike's extra hit is Moonsign Ascendant Gleam's, not the stance's, so it is left out
  [
    10_000_126,
    {
      hits: {
        burst: { combatTalent: BURST, labels: ["Skill 1-Hit DMG", "Skill 2-Hit DMG"] },
        "stances.lunarPhaseShift.chargedAttack": {
          combatTalent: SKILL,
          labels: ["Lunar Phase Shift Charged Attack DMG"],
        },
        "stances.lunarPhaseShift.normalAttacks.0": { combatTalent: SKILL, labels: ["Lunar Phase Shift 1-Hit DMG"] },
        "stances.lunarPhaseShift.normalAttacks.1": { combatTalent: SKILL, labels: ["Lunar Phase Shift 2-Hit DMG"] },
        "stances.lunarPhaseShift.normalAttacks.2": { combatTalent: SKILL, labels: ["Lunar Phase Shift 3-Hit DMG"] },
        "stances.lunarPhaseShift.normalAttacks.3": { combatTalent: SKILL, labels: ["Lunar Phase Shift 4-Hit DMG"] },
        "stances.lunarPhaseShift.skill": {
          combatTalent: SKILL,
          labels: ["Spirit Steed's Stride 1-Hit DMG", "Spirit Steed's Stride 2-Hit DMG"],
        },
      },
      values: { "parameters.lunarPhaseShiftSeconds": { combatTalent: SKILL, label: "Lunar Phase Shift Duration" } },
    },
  ],
  // Illuga
  [
    10_000_127,
    {
      hits: {
        burst: { combatTalent: BURST, labels: ["Skill DMG"] },
        "skillHolds.0.action": { combatTalent: SKILL, labels: ["Hold DMG"] },
        skill: { combatTalent: SKILL, labels: ["Press DMG"] },
      },
      values: { "skillHolds.0.cooldownSeconds": { combatTalent: SKILL, label: "CD" } },
    },
  ],
  // Sigewinne's avatar id, as her kit module names it. Her bubble's and final bounce's healing read their parameters
  // From her skill's labels, the share of Max HP first and the flat amount after
  [
    10_000_095,
    {
      values: {
        "parameters.bolsteringBubblebalmHealingFlat": {
          combatTalent: SKILL,
          label: "Bolstering Bubblebalm Healing",
          position: 1,
        },
        "parameters.bolsteringBubblebalmHealingShare": {
          combatTalent: SKILL,
          label: "Bolstering Bubblebalm Healing",
          position: 0,
        },
        "parameters.finalBounceHealingShare": { combatTalent: SKILL, label: "Final Bounce Healing", position: 0 },
      },
    },
  ],
  // Vesna
  [
    10_000_143,
    {
      hits: {
        burst: { combatTalent: BURST, labels: ["Spirit Blade DMG"] },
        skill: { combatTalent: SKILL, labels: ["Skill DMG"] },
      },
    },
  ],
]);
