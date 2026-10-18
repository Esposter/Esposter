// The game's tables the enemies' kinds are read from, in the dump beside its text maps
export const MONSTER_TABLE_NAME = "MonsterExcelConfigData";
// A monster's name is filed under its description, since the hash its row holds names no text in any language
export const MONSTER_DESCRIBE_TABLE_NAME = "MonsterDescribeExcelConfigData";
export const MONSTER_CURVE_TABLE_NAME = "MonsterCurveExcelConfigData";
// An archive row of a monster rather than of wildlife
export const MONSTER_CODEX_TYPE = "CODEX_MONSTER";
// The security level a monster is at when the monster table leaves it out, which is a common monster's
export const DEFAULT_SECURITY_LEVEL = "NORMAL";
// The archive group a living being is in when the codex leaves it out, which is the elemental lifeforms
export const DEFAULT_CODEX_SUBTYPE = "CODEX_SUBTYPE_ELEMENTAL";
// The stat each base value grows by, as the monster table names it
export const BASE_HEALTH_PROPERTY = "FIGHT_PROP_BASE_HP";
export const BASE_ATTACK_PROPERTY = "FIGHT_PROP_BASE_ATTACK";
export const BASE_DEFENSE_PROPERTY = "FIGHT_PROP_BASE_DEFENSE";
export const REGIONS_DIRECTORY = "regions";
// The weekly bosses' kinds, which no camp places and which the enemies dataset publishes ahead of the weekly claim that reads
// Them: Stormterror, by its monster id, whose row the monster table gives
export const WEEKLY_BOSS_KIND_IDS: number[] = [29010104];
