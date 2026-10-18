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
