import { EnemyKindId } from "genshin-world";

// The game's tables the enemies' kinds are read from, in the dump beside its text maps
export const MONSTER_TABLE_NAME = "MonsterExcelConfigData";
// A monster's name is filed under its description, since the hash its row holds names no text in any language
export const MONSTER_DESCRIBE_TABLE_NAME = "MonsterDescribeExcelConfigData";
export const MONSTER_CURVE_TABLE_NAME = "MonsterCurveExcelConfigData";
// An archive row of a monster rather than of wildlife
export const MONSTER_CODEX_TYPE = "CODEX_MONSTER";
// The stat each base value grows by, as the monster table names it
export const BASE_HEALTH_PROPERTY = "FIGHT_PROP_BASE_HP";
export const BASE_ATTACK_PROPERTY = "FIGHT_PROP_BASE_ATTACK";
export const BASE_DEFENSE_PROPERTY = "FIGHT_PROP_BASE_DEFENSE";
export const REGIONS_DIRECTORY = "regions";
// The weekly bosses' kinds, which no camp places and which the enemies dataset publishes ahead of the weekly claim that reads
// Them: Stormterror
export const WEEKLY_BOSS_KIND_IDS: EnemyKindId[] = [EnemyKindId.StormterrorDvalin];
// The bosses whose moves genshin-world's boss table gives, which the monsters subcommand names beside the placed kinds
export const BOSS_KIND_IDS: EnemyKindId[] = [
  EnemyKindId.AnemoHypostasis,
  EnemyKindId.PerpetualMechanicalArray,
  EnemyKindId.StormterrorDvalin,
];
// The wiki module whose Enemies table gives each drop family's Mora and materials, by the members a Drops Table names
export const DROPS_TABLE_WIKI_MODULE_TITLE = "Module:Drops Table/data";
// The wiki page a Drops template is written as, which invokes the drops module, and the module's data, the Enemies table a
// Template's materials are read from by the one entry that names it
export const DROPS_TEMPLATE_WIKI_TITLE = "Template:Drops";
export const DROPS_DATA_WIKI_TITLE = "Module:Drops/data";
// The call a Drops template makes to the drops module, which the template's page must invoke to give its materials
export const DROPS_MODULE_INVOCATION = "{{#invoke:Drops|main}}";
// The block each monster's Animator controller is exported from, by the controller's name. A controller's block is found
// Once, by scanning the monster-named blocks, and recorded here, so a run reads the record rather than scanning again. The
// Asset index names no AnimatorController, so no index row finds it
export const MONSTER_CONTROLLER_BLOCK_MAP: Readonly<Record<string, string>> = {
  Monster_Hili_None_01: "00/11877482.blk",
};
