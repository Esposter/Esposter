import type { KitSlotLabels } from "#src/models/genshinAssets/kits/tables/KitSlotLabels";

import { CombatTalent } from "genshin-world";

const BURST = CombatTalent.ElementalBurst;
const NORMAL_ATTACK = CombatTalent.NormalAttack;
const SKILL = CombatTalent.ElementalSkill;

// The labels a character's record slots read from its talent tables, keyed by avatar id. Its entries are folder-less
// Characters, and Clorinde and Flins, who have gcsim folders and read these slots from the tables all the same. Nefer's
// Phantasm Performance replaces her charged attack while Shadow Dance holds, and Zibai's Lunar Phase Shift replaces her
// Strikes, charged attack and Spirit Steed's Stride while it holds, each stance read from its skill's labels. Illuga's
// Hold is his skill's hold, read from its Hold DMG label. Vesna's skill tag is the wiki's, so her skill reads its label
// Here like her burst
export const CharacterIdSlotHitLabelsMap: ReadonlyMap<number, KitSlotLabels> = new Map<number, KitSlotLabels>([
  // Clorinde. Her Swift Hunt's DMG label gives its normal shot the first value and its piercing shot the second, and
  // Each of the three hits of a shot reads its shot's value, as gcsim's Swift Hunt multipliers do. Her skill rows read
  // Onto the parameters her module names, a row's values in order, so Impale the Night Healing's low and full heals are
  // Its first and second
  [
    10_000_098,
    {
      values: {
        "hits.swiftHuntNormalShot.0.multiplier": { combatTalent: SKILL, label: "Swift Hunt DMG", position: 0 },
        "hits.swiftHuntNormalShot.1.multiplier": { combatTalent: SKILL, label: "Swift Hunt DMG", position: 0 },
        "hits.swiftHuntNormalShot.2.multiplier": { combatTalent: SKILL, label: "Swift Hunt DMG", position: 0 },
        "hits.swiftHuntPiercingShot.0.multiplier": { combatTalent: SKILL, label: "Swift Hunt DMG", position: 1 },
        "hits.swiftHuntPiercingShot.1.multiplier": { combatTalent: SKILL, label: "Swift Hunt DMG", position: 1 },
        "hits.swiftHuntPiercingShot.2.multiplier": { combatTalent: SKILL, label: "Swift Hunt DMG", position: 1 },
        "parameters.bondOfLifeConversionHealing": { combatTalent: SKILL, label: "Bond of Life Conversion" },
        "parameters.impaleTheNightLowBondOfLifeHealing": {
          combatTalent: SKILL,
          label: "Impale the Night Healing",
          position: 0,
        },
        "parameters.impaleTheNightFullBondOfLifeHealing": {
          combatTalent: SKILL,
          label: "Impale the Night Healing",
          position: 1,
        },
        "parameters.nightVigilSeconds": { combatTalent: SKILL, label: "Night Vigil Duration" },
        "parameters.swiftHuntBondOfLifeGain": { combatTalent: SKILL, label: "Swift Hunt Bond of Life Gain" },
      },
    },
  ],
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
        "parameters.phantasmPerformanceCharges": { combatTalent: SKILL, label: "Phantasm Performance Charges" },
        "parameters.shadowDanceSeconds": { combatTalent: SKILL, label: "Shadow Dance Duration" },
        "stances.phantasmPerformance.chargedAttackStamina": {
          combatTalent: NORMAL_ATTACK,
          label: "Shadow Dance Charged Attack Stamina Cost",
        },
      },
    },
  ],
  // Zibai. Her fourth strike's second hit is the extra hit Moonsign gates, which the stance's behaviour plays at the
  // Moonsign level it reads, as Columbina's are
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
        "stances.lunarPhaseShift.normalAttacks.3": {
          combatTalent: SKILL,
          labels: ["Lunar Phase Shift 4-Hit DMG", "Lunar Phase Shift 4-Hit Additional DMG"],
        },
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
      values: {
        "parameters.nightingaleSongGeoDamageBonus": { combatTalent: BURST, label: "Geo DMG Bonus" },
        "skillHolds.0.cooldownSeconds": { combatTalent: SKILL, label: "CD" },
      },
    },
  ],
  // Shenhe's avatar id, as her kit module names it. Her Icy Quill's ATK ratio, press and hold durations and trigger quotas
  // Read from her skill's labels, the ratio's ATK label first and the durations and quotas by their press and hold positions
  [
    10_000_063,
    {
      values: {
        "parameters.icyQuillAttackRatio": { combatTalent: SKILL, label: "DMG Bonus" },
        "parameters.icyQuillHoldSeconds": { combatTalent: SKILL, label: "Press/Hold Duration", position: 1 },
        "parameters.icyQuillHoldTriggers": { combatTalent: SKILL, label: "Press/Hold Trigger Quota", position: 1 },
        "parameters.icyQuillPressSeconds": { combatTalent: SKILL, label: "Press/Hold Duration", position: 0 },
        "parameters.icyQuillPressTriggers": { combatTalent: SKILL, label: "Press/Hold Trigger Quota", position: 0 },
      },
    },
  ],
  // Flins's avatar id, as his kit module names it. Cometh the Night's initial, middle and final hits read their multipliers
  // From its skill labels, the middle label once for each of its four hits
  [
    10_000_120,
    {
      values: {
        "burst.hits.0.multiplier": { combatTalent: BURST, label: "Initial Skill DMG" },
        "burst.hits.1.multiplier": { combatTalent: BURST, label: "Middle Phase Lunar-Charged DMG" },
        "burst.hits.2.multiplier": { combatTalent: BURST, label: "Middle Phase Lunar-Charged DMG" },
        "burst.hits.3.multiplier": { combatTalent: BURST, label: "Middle Phase Lunar-Charged DMG" },
        "burst.hits.4.multiplier": { combatTalent: BURST, label: "Middle Phase Lunar-Charged DMG" },
        "burst.hits.5.multiplier": { combatTalent: BURST, label: "Final Phase Lunar-Charged DMG" },
      },
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
  // Jahoda. Her Meowball DMG label gives each Meowball's multiplier, read from the proud skill group its skill's table holds
  [10_000_124, { values: { "parameters.meowballTalentMultiplier": { combatTalent: SKILL, label: "Meowball DMG" } } }],
]);
