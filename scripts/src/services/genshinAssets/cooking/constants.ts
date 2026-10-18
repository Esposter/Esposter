import { CookingQuality, DishTarget } from "genshin-world";

// The game's cook recipe, cook bonus and compound tables in the dump, read by their names. The material table is the
// Crafting's, read by the same name
export const COOK_RECIPE_TABLE_NAME = "CookRecipeExcelConfigData";
export const COOK_BONUS_TABLE_NAME = "CookBonusExcelConfigData";
export const COMPOUND_TABLE_NAME = "CompoundExcelConfigData";
// The game's buff table in the dump, whose buff a dish's item names by its server buff id
export const BUFF_TABLE_NAME = "BuffExcelConfigData";
// The use an item carries to learn the cook recipe it names as its first parameter, one item for each recipe
export const UNLOCK_COOK_RECIPE_USE_OP = "ITEM_USE_UNLOCK_COOK_RECIPE";
// The ability a dish's heal buff names, which heals by a share of its target's Max HP and a flat amount, the buff's
// Description writing both as `X%+Y`, then any alternatives the game lists in full-width parentheses
export const HEAL_BUFF_ABILITY_NAME = "ReHP_Ins&Con";
export const HEAL_BUFF_DESCRIPTION_REGEX = /^(?<percent>\d+)%\+(?<flat>\d+)(?:（[^）]*）)?$/u;
// The ability a dish's revive buff names, whose description writes the HP it restores to a fallen character
export const REVIVE_BUFF_ABILITY_NAME = "revive_buff";
export const REVIVE_BUFF_DESCRIPTION_REGEX = /^恢复(?<flat>\d+)HP$/u;
// The percent a heal's share is out of
export const HEAL_PERCENT_TOTAL = 100;
// The use a dish's item carries to add its buff, and the target each use names: the selected character, alive or down,
// Or the party
export const ADD_SERVER_BUFF_USE_OP = "ITEM_USE_ADD_SERVER_BUFF";
export const DISH_TARGET_MAP: Record<string, DishTarget> = {
  ITEM_USE_TARGET_CUR_TEAM: DishTarget.Party,
  ITEM_USE_TARGET_SPECIFY_ALIVE_AVATAR: DishTarget.Selected,
  ITEM_USE_TARGET_SPECIFY_DEAD_AVATAR: DishTarget.Selected,
};
// The bonus type of a character's special dish, which replaces the dish cooked in its recipe at a chance
export const COOK_BONUS_REPLACE_TYPE = "COOK_BONUS_REPLACE";
// The proud skill table, whose cooking talents are the rows of a cooking effect
export const PROUD_SKILL_TABLE_NAME = "ProudSkillExcelConfigData";
// The compound type of a processing row, the one the bench's processing of ingredients is built from. A random row
// Draws its output from a drop table this build does not read, so it is left out
export const COMPOUND_COOK_TYPE = "COMPOUND_COOK";
// The quality each of a dish's results is, by the food quality its item row names
export const FoodQualityCookingQualityMap: Record<string, CookingQuality> = {
  FOOD_QUALITY_DELICIOUS: CookingQuality.Delicious,
  FOOD_QUALITY_ORDINARY: CookingQuality.Regular,
  FOOD_QUALITY_STRANGE: CookingQuality.Suspicious,
};
