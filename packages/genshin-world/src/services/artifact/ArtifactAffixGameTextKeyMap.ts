import { Attribute } from "#src/models/character/Attribute";
import { GameTextKey } from "genshin-text";

// The name each attribute an artifact's affixes raise goes by in the game. A percentage goes by its flat attribute's name,
// As the game's artifact lists give it, which is provisional until the game's own names for the percentages are keyed
export const ArtifactAffixGameTextKeyMap: ReadonlyMap<Attribute, GameTextKey> = new Map<Attribute, GameTextKey>([
  [Attribute.AnemoDamageBonus, GameTextKey.AttributeAnemoDamageBonus],
  [Attribute.Attack, GameTextKey.AttributeAttack],
  [Attribute.AttackPercent, GameTextKey.AttributeAttack],
  [Attribute.CriticalDamage, GameTextKey.AttributeCriticalDamage],
  [Attribute.CriticalRate, GameTextKey.AttributeCriticalRate],
  [Attribute.CryoDamageBonus, GameTextKey.AttributeCryoDamageBonus],
  [Attribute.Defense, GameTextKey.AttributeDefense],
  [Attribute.DefensePercent, GameTextKey.AttributeDefense],
  [Attribute.DendroDamageBonus, GameTextKey.AttributeDendroDamageBonus],
  [Attribute.ElectroDamageBonus, GameTextKey.AttributeElectroDamageBonus],
  [Attribute.ElementalMastery, GameTextKey.AttributeElementalMastery],
  [Attribute.EnergyRecharge, GameTextKey.AttributeEnergyRecharge],
  [Attribute.GeoDamageBonus, GameTextKey.AttributeGeoDamageBonus],
  [Attribute.Health, GameTextKey.AttributeMaxHealth],
  [Attribute.HealthPercent, GameTextKey.AttributeMaxHealth],
  [Attribute.HealingBonus, GameTextKey.AttributeHealingBonus],
  [Attribute.HydroDamageBonus, GameTextKey.AttributeHydroDamageBonus],
  [Attribute.PhysicalDamageBonus, GameTextKey.AttributePhysicalDamageBonus],
  [Attribute.PyroDamageBonus, GameTextKey.AttributePyroDamageBonus],
]);
