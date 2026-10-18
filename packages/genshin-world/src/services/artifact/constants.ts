import type { WeightedValue } from "#src/models/shared/WeightedValue";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";

// Adventurer's id in the set table
export const ADVENTURER_ARTIFACT_SET_ID = 10_010;
// Berserker's id in the set table
export const BERSERKER_ARTIFACT_SET_ID = 10_005;
// Instructor's id in the set table
export const INSTRUCTOR_ARTIFACT_SET_ID = 10_007;
// The Exile's id in the set table
export const EXILE_ARTIFACT_SET_ID = 10_009;
// Lucky Dog's id in the set table
export const LUCKY_DOG_ARTIFACT_SET_ID = 10_011;
// Traveling Doctor's id in the set table
export const TRAVELING_DOCTOR_ARTIFACT_SET_ID = 10_013;
// Defender's Will's id in the set table
export const DEFENDERS_WILL_ARTIFACT_SET_ID = 10_003;
// Martial Artist's id in the set table
export const MARTIAL_ARTIST_ARTIFACT_SET_ID = 10_006;
// Maiden Beloved's id in the set table
export const MAIDEN_BELOVED_ARTIFACT_SET_ID = 14_004;
// Gladiator's Finale's id in the set table
export const GLADIATORS_FINALE_ARTIFACT_SET_ID = 15_001;
// Wanderer's Troupe's id in the set table
export const WANDERERS_TROUPE_ARTIFACT_SET_ID = 15_003;
// Noblesse Oblige's id in the set table
export const NOBLESSE_OBLIGE_ARTIFACT_SET_ID = 15_007;
// Retracing Bolide's id in the set table
export const RETRACING_BOLIDE_ARTIFACT_SET_ID = 15_015;
// Heart of Depth's id in the set table
export const HEART_OF_DEPTH_ARTIFACT_SET_ID = 15_016;
// Brave Heart's id in the set table
export const BRAVE_HEART_ARTIFACT_SET_ID = 10_002;
// Emblem of Severed Fate's id in the set table
export const EMBLEM_OF_SEVERED_FATE_ARTIFACT_SET_ID = 15_020;
// Gambler's id in the set table
export const GAMBLER_ARTIFACT_SET_ID = 10_008;
// Lavawalker's id in the set table
export const LAVAWALKER_ARTIFACT_SET_ID = 14_003;
// Marechaussee Hunter's id in the set table
export const MARECHAUSSEE_HUNTER_ARTIFACT_SET_ID = 15_031;
// Obsidian Codex's id in the set table
export const OBSIDIAN_CODEX_ARTIFACT_SET_ID = 15_038;
// Resolution of Sojourner's id in the set table
export const RESOLUTION_OF_SOJOURNER_ARTIFACT_SET_ID = 10_001;
// Thundersoother's id in the set table
export const THUNDERSOOTER_ARTIFACT_SET_ID = 14_002;
// Blizzard Strayer's id in the set table
export const BLIZZARD_STRAYER_ARTIFACT_SET_ID = 14_001;
// Deepwood Memories' id in the set table
export const DEEPWOOD_MEMORIES_ARTIFACT_SET_ID = 15_025;
// Desert Pavilion Chronicle's id in the set table
export const DESERT_PAVILION_CHRONICLE_ARTIFACT_SET_ID = 15_027;
// Finale of the Deep Galleries' id in the set table
export const FINALE_OF_THE_DEEP_GALLERIES_ARTIFACT_SET_ID = 15_040;
// Golden Troupe's id in the set table
export const GOLDEN_TROUPE_ARTIFACT_SET_ID = 15_032;
// Scholar's id in the set table
export const SCHOLAR_ARTIFACT_SET_ID = 10_012;
// Tenacity of the Millelith's id in the set table
export const TENACITY_OF_THE_MILLELITH_ARTIFACT_SET_ID = 15_017;
// Bloodstained Chivalry's id in the set table
export const BLOODSTAINED_CHIVALRY_ARTIFACT_SET_ID = 15_008;
// Shimenawa's Reminiscence's id in the set table
export const SHIMENAWAS_REMINISCENCE_ARTIFACT_SET_ID = 15_019;
// Ocean-Hued Clam's id in the set table
export const OCEAN_HUED_CLAM_ARTIFACT_SET_ID = 15_022;
// Vermillion Hereafter's id in the set table
export const VERMILLION_HEREAFTER_ARTIFACT_SET_ID = 15_023;
// Echoes of an Offering's id in the set table
export const ECHOES_OF_AN_OFFERING_ARTIFACT_SET_ID = 15_024;
// Nymph's Dream's id in the set table
export const NYMPHS_DREAM_ARTIFACT_SET_ID = 15_029;
// Long Night's Oath's id in the set table
export const LONG_NIGHTS_OATH_ARTIFACT_SET_ID = 15_039;
// Gilded Dreams's id in the set table
export const GILDED_DREAMS_ARTIFACT_SET_ID = 15_026;
export const PALE_FLAME_ARTIFACT_SET_ID = 15_018;
export const HUSK_OF_OPULENT_DREAMS_ARTIFACT_SET_ID = 15_021;
export const VOURUKASHAS_GLOW_ARTIFACT_SET_ID = 15_030;
// Song of Days Past's id in the set table
export const SONG_OF_DAYS_PAST_ARTIFACT_SET_ID = 15_033;
// Viridescent Venerer's id in the set table
export const VIRIDESCENT_VENERER_ARTIFACT_SET_ID = 15_002;
// Disenchantment in Deep Shadow's id in the set table
export const DISENCHANTMENT_IN_DEEP_SHADOW_ARTIFACT_SET_ID = 15_046;
// The share of the EXP a fodder artifact was levelled with that the enhancement gives back, the rest of it spent
export const FODDER_RECOVERY_RATE = 0.8;
// The most minor affixes an artifact holds: past four, a level raises one rather than adding one
export const MAX_MINOR_AFFIX_COUNT = 4;
// The chance an enhancement's EXP is doubled or quintupled by the wiki's Artifact EXP page, as weights out of a hundred
export const EXPERIENCE_BONUS_WEIGHTS: readonly WeightedValue<number>[] = [
  { value: 1, weight: 90 },
  { value: 2, weight: 9 },
  { value: 5, weight: 1 },
];
// Each slot's main affixes by the wiki's Artifact/Distribution page. Only the attributes a slot's pool holds are drawn,
// So an attribute left out here is never its main affix
export const ArtifactMainAffixWeightMap: Readonly<Record<ArtifactSlot, Readonly<Partial<Record<Attribute, number>>>>> =
  {
    [ArtifactSlot.CircletOfLogos]: {
      [Attribute.AttackPercent]: 22,
      [Attribute.CriticalDamage]: 10,
      [Attribute.CriticalRate]: 10,
      [Attribute.DefensePercent]: 22,
      [Attribute.ElementalMastery]: 4,
      [Attribute.HealingBonus]: 10,
      [Attribute.HealthPercent]: 22,
    },
    [ArtifactSlot.FlowerOfLife]: { [Attribute.Health]: 100 },
    [ArtifactSlot.GobletOfEonothem]: {
      [Attribute.AnemoDamageBonus]: 5,
      [Attribute.AttackPercent]: 19.25,
      [Attribute.CryoDamageBonus]: 5,
      [Attribute.DefensePercent]: 19,
      [Attribute.DendroDamageBonus]: 5,
      [Attribute.ElectroDamageBonus]: 5,
      [Attribute.ElementalMastery]: 2.5,
      [Attribute.GeoDamageBonus]: 5,
      [Attribute.HealthPercent]: 19.25,
      [Attribute.HydroDamageBonus]: 5,
      [Attribute.PhysicalDamageBonus]: 5,
      [Attribute.PyroDamageBonus]: 5,
    },
    [ArtifactSlot.PlumeOfDeath]: { [Attribute.Attack]: 100 },
    [ArtifactSlot.SandsOfEon]: {
      [Attribute.AttackPercent]: 26.66,
      [Attribute.DefensePercent]: 26.66,
      [Attribute.ElementalMastery]: 10,
      [Attribute.EnergyRecharge]: 10,
      [Attribute.HealthPercent]: 26.68,
    },
  };
// Each minor affix's weight among the ones a rarity's pool still holds, by the wiki's Artifact/Distribution page: the
// Flat attributes weigh six, the percentages and the rest four, and the critical ones three
export const ArtifactMinorAffixWeightMap: Readonly<Partial<Record<Attribute, number>>> = {
  [Attribute.Attack]: 6,
  [Attribute.AttackPercent]: 4,
  [Attribute.CriticalDamage]: 3,
  [Attribute.CriticalRate]: 3,
  [Attribute.Defense]: 6,
  [Attribute.DefensePercent]: 4,
  [Attribute.ElementalMastery]: 4,
  [Attribute.EnergyRecharge]: 4,
  [Attribute.Health]: 6,
  [Attribute.HealthPercent]: 4,
};
