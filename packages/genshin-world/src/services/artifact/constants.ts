import type { WeightedValue } from "#src/models/shared/WeightedValue";

import { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import { Attribute } from "#src/models/character/Attribute";

// The share of the EXP a fodder artifact was levelled with that the enhancement gives back, the rest of it spent
export const FODDER_RECOVERY_RATE = 0.8;
// The most minor affixes an artifact holds: past four, a level raises one rather than adding one
export const MAX_MINOR_AFFIX_COUNT = 4;
// Provisional: the chance an enhancement's EXP is doubled or quintupled, the wiki's Artifact EXP bonus, as weights out of
// A hundred. Not measured from the game
export const EXPERIENCE_BONUS_WEIGHTS: readonly WeightedValue<number>[] = [
  { value: 1, weight: 90 },
  { value: 2, weight: 9 },
  { value: 5, weight: 1 },
];
// Provisional: each slot's main affixes by the wiki's Artifact distribution, Goblet's as its 3.0 table gives it. Only the
// Attributes a slot's pool holds are drawn, so an attribute left out here is never its main affix
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
      [Attribute.AttackPercent]: 19.175,
      [Attribute.CryoDamageBonus]: 5,
      [Attribute.DefensePercent]: 19.15,
      [Attribute.DendroDamageBonus]: 5,
      [Attribute.ElectroDamageBonus]: 5,
      [Attribute.ElementalMastery]: 2.5,
      [Attribute.GeoDamageBonus]: 5,
      [Attribute.HealthPercent]: 19.175,
      [Attribute.HydroDamageBonus]: 5,
      [Attribute.PhysicalDamageBonus]: 5,
      [Attribute.PyroDamageBonus]: 5,
    },
    [ArtifactSlot.PlumeOfDeath]: { [Attribute.Attack]: 100 },
    [ArtifactSlot.SandsOfEon]: {
      [Attribute.AttackPercent]: 26.68,
      [Attribute.DefensePercent]: 26.66,
      [Attribute.ElementalMastery]: 10,
      [Attribute.EnergyRecharge]: 10,
      [Attribute.HealthPercent]: 26.68,
    },
  };
// Provisional: each minor affix's weight among the ones a rarity's pool still holds, by the wiki's Artifact distribution:
// The flat attributes weigh six, the percentages and the rest four, and the critical ones three
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
