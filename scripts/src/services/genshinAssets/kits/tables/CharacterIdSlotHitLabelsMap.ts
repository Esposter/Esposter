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
  // Venti. Stormeye's seconds read its burst's Duration label
  [10_000_022, { values: { "parameters.stormeyeSeconds": { combatTalent: BURST, label: "Duration" } } }],
  // Xingqiu. Each rainscreen's two hits read the Skill DMG label's two multipliers, the first and second positions, and
  // Rain Sword and Raincutter's seconds read their skill's and burst's Duration labels
  [
    10_000_025,
    {
      values: {
        "hits.evilsootherRainscreen.0.multiplier": { combatTalent: SKILL, label: "Skill DMG", position: 0 },
        "hits.evilsootherRainscreen.1.multiplier": { combatTalent: SKILL, label: "Skill DMG", position: 1 },
        "hits.rainscreen.0.multiplier": { combatTalent: SKILL, label: "Skill DMG", position: 0 },
        "hits.rainscreen.1.multiplier": { combatTalent: SKILL, label: "Skill DMG", position: 1 },
        "parameters.raincutterSeconds": { combatTalent: BURST, label: "Duration" },
        "parameters.rainSwordsSeconds": { combatTalent: SKILL, label: "Duration" },
      },
    },
  ],
  // Bennett. Fantastic Voyage's healing reads its burst's Continuous Regeneration label, the share of Max HP and the flat
  // Amount at its positions, and its ATK share, field seconds read its ATK Bonus Ratio and Duration labels
  [
    10_000_032,
    {
      values: {
        "parameters.fantasticVoyageBaseAttackShare": { combatTalent: BURST, label: "ATK Bonus Ratio" },
        "parameters.fantasticVoyageFieldSeconds": { combatTalent: BURST, label: "Duration" },
        "parameters.fantasticVoyageFlatHeal": {
          combatTalent: BURST,
          label: "Continuous Regeneration Per Sec",
          position: 1,
        },
        "parameters.fantasticVoyageMaxHealthHealShare": {
          combatTalent: BURST,
          label: "Continuous Regeneration Per Sec",
          position: 0,
        },
      },
    },
  ],
  // Diona. Icy Paws' hold shield multiplier reads its skill's Duration label at its position, and Signature Mix's
  // Duration reads her burst's, the field's seconds the burst's Duration label gives
  [
    10_000_039,
    {
      values: {
        "parameters.holdShieldMultiplier": { combatTalent: SKILL, label: "Duration" },
        "parameters.signatureMixSeconds": { combatTalent: BURST, label: "Duration" },
      },
    },
  ],
  // Xinyan. Each of her three shields reads its level's DMG Absorption label, the Defense share at the first position and
  // The flat amount at the second
  [
    10_000_044,
    {
      values: {
        "parameters.shieldDefenseShares.0": {
          combatTalent: SKILL,
          label: "Shield Level 1 DMG Absorption",
          position: 0,
        },
        "parameters.shieldDefenseShares.1": {
          combatTalent: SKILL,
          label: "Shield Level 2 DMG Absorption",
          position: 0,
        },
        "parameters.shieldDefenseShares.2": {
          combatTalent: SKILL,
          label: "Shield Level 3 DMG Absorption",
          position: 0,
        },
        "parameters.shieldFlatHealths.0": { combatTalent: SKILL, label: "Shield Level 1 DMG Absorption", position: 1 },
        "parameters.shieldFlatHealths.1": { combatTalent: SKILL, label: "Shield Level 2 DMG Absorption", position: 1 },
        "parameters.shieldFlatHealths.2": { combatTalent: SKILL, label: "Shield Level 3 DMG Absorption", position: 1 },
      },
    },
  ],
  // Rosaria. Rites of Termination's field seconds read its burst's Duration label
  [10_000_045, { values: { "parameters.ritesOfTerminationSeconds": { combatTalent: BURST, label: "Duration" } } }],
  // Yanfei. Done Deal's charged attack damage bonus reads its burst's Charged Attack DMG Bonus label
  [
    10_000_048,
    {
      values: {
        "parameters.doneDealChargedAttackDamageBonus": { combatTalent: BURST, label: "Charged Attack DMG Bonus" },
      },
    },
  ],
  // Yoimiya. Niwabi Fire Dance's seconds read its skill's Duration label
  [10_000_049, { values: { "parameters.niwabiFireDanceSeconds": { combatTalent: SKILL, label: "Duration" } } }],
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
  // Mika's avatar id, as his kit module names it. His Starfrost Swirl's ATK SPD bonus is his skill's label, and his
  // Eagleplume's heal is his burst's, the share of Max HP first and the flat amount after
  [
    10_000_080,
    {
      values: {
        "parameters.atkSpdBuff": { combatTalent: SKILL, label: "ATK SPD Bonus" },
        "parameters.burstHealF": { combatTalent: BURST, label: "Eagleplume Healing", position: 1 },
        "parameters.burstHealP": { combatTalent: BURST, label: "Eagleplume Healing", position: 0 },
      },
    },
  ],
  // Chiori. Tamoto's duration reads its skill's Tamoto Duration label in seconds, and her kit adds each spawn to it
  [10_000_094, { values: { "parameters.tamotoSeconds": { combatTalent: SKILL, label: "Tamoto Duration" } } }],
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
        "parameters.impaleTheNightFullBondOfLifeHealing": {
          combatTalent: SKILL,
          label: "Impale the Night Healing",
          position: 1,
        },
        "parameters.impaleTheNightLowBondOfLifeHealing": {
          combatTalent: SKILL,
          label: "Impale the Night Healing",
          position: 0,
        },
        "parameters.nightVigilSeconds": { combatTalent: SKILL, label: "Night Vigil Duration" },
        "parameters.swiftHuntBondOfLifeGain": { combatTalent: SKILL, label: "Swift Hunt Bond of Life Gain" },
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
  // Aino. Her Water Ball reads its multiplier from her burst's label, which gcsim's join does not reach, since her burst's
  // Cooldown tag is a tuple return the reader does not resolve, so the attack is left out of the kit
  [10_000_121, { values: { "hits.waterBall.multiplier": { combatTalent: BURST, label: "Water Ball DMG" } } }],
  // Nefer
  [
    10_000_122,
    {
      hits: {
        burst: { combatTalent: BURST, labels: ["1-Hit DMG", "2-Hit DMG"] },
        skill: { combatTalent: SKILL, labels: ["Skill DMG"] },
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
  // Jahoda. Her robot's strike reads its multiplier from her burst's label, which gcsim's join does not reach
  [
    10_000_124,
    {
      values: {
        "hitFields.robotStrike.multiplier": {
          combatTalent: BURST,
          label: "Purrsonal Coordinated Assistance Robot DMG",
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
        skill: { combatTalent: SKILL, labels: ["Press DMG"] },
        "skillHolds.0.action": { combatTalent: SKILL, labels: ["Hold DMG"] },
      },
      values: {
        "parameters.nightingaleSongGeoDamageBonus": { combatTalent: BURST, label: "Geo DMG Bonus" },
        "skillHolds.0.cooldownSeconds": { combatTalent: SKILL, label: "CD" },
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
