import { Attribute } from "#src/models/character/Attribute";
import {
  ADVANCED_ATTRIBUTE_GAME_TEXT_KEYS,
  BASE_ATTRIBUTE_GAME_TEXT_KEYS,
  ELEMENTAL_ATTRIBUTE_GAME_TEXT_KEYS,
} from "#src/services/character/constants";
import { GameTextKey } from "genshin-text";

// The game's name for each attribute the attribute tables list, plus the three a weapon's secondary can be that they do
// Not: Elemental Mastery, and the two percentages, captioned by their flat attribute's name as the artifact lists caption
// Them. Defense % has no name, since the tables name only the base DEF, so it is absent and its caption is left undrawn
export const AttributeGameTextKeyMap: ReadonlyMap<Attribute, GameTextKey> = new Map<Attribute, GameTextKey>([
  ...BASE_ATTRIBUTE_GAME_TEXT_KEYS,
  ...ADVANCED_ATTRIBUTE_GAME_TEXT_KEYS,
  ...ELEMENTAL_ATTRIBUTE_GAME_TEXT_KEYS,
  [Attribute.ElementalMastery, GameTextKey.AttributeElementalMastery],
  [Attribute.AttackPercent, GameTextKey.AttributeAttack],
  [Attribute.HealthPercent, GameTextKey.AttributeMaxHealth],
]);
