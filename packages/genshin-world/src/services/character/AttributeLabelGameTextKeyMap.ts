import { Attribute } from "#src/models/character/Attribute";
import {
  ADVANCED_ATTRIBUTE_GAME_TEXT_KEYS,
  BASE_ATTRIBUTE_GAME_TEXT_KEYS,
  ELEMENTAL_ATTRIBUTE_GAME_TEXT_KEYS,
} from "#src/services/character/constants";
import { GameTextKey } from "genshin-text";

// The game's name for each attribute a list labels: the Details list's rows, a weapon's secondary and an artifact's affixes.
// A percentage goes by its flat attribute's name, as the game's artifact lists give it, so Defense % is labelled DEF. That is
// Provisional until the game's own names for the percentages are keyed
export const AttributeLabelGameTextKeyMap: ReadonlyMap<Attribute, GameTextKey> = new Map<Attribute, GameTextKey>([
  ...BASE_ATTRIBUTE_GAME_TEXT_KEYS,
  ...ADVANCED_ATTRIBUTE_GAME_TEXT_KEYS,
  ...ELEMENTAL_ATTRIBUTE_GAME_TEXT_KEYS,
  [Attribute.Attack, GameTextKey.AttributeAttack],
  [Attribute.AttackPercent, GameTextKey.AttributeAttack],
  [Attribute.Defense, GameTextKey.AttributeDefense],
  [Attribute.DefensePercent, GameTextKey.AttributeDefense],
  [Attribute.ElementalMastery, GameTextKey.AttributeElementalMastery],
  [Attribute.Health, GameTextKey.AttributeMaxHealth],
  [Attribute.HealthPercent, GameTextKey.AttributeMaxHealth],
]);
