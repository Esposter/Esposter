import { ArchiveSection } from "genshin-world";

// The game's tables the Archive's sections are read from, in the dump beside its text maps, read by their names
export const WEAPON_CODEX_TABLE_NAME = "WeaponCodexExcelConfigData";
export const WEAPON_TABLE_NAME = "WeaponExcelConfigData";
export const RELIQUARY_CODEX_TABLE_NAME = "ReliquaryCodexExcelConfigData";
export const RELIQUARY_SET_TABLE_NAME = "ReliquarySetExcelConfigData";
export const EQUIP_AFFIX_TABLE_NAME = "EquipAffixExcelConfigData";
export const MATERIAL_CODEX_TABLE_NAME = "MaterialCodexExcelConfigData";
export const MATERIAL_TABLE_NAME = "MaterialExcelConfigData";
export const BOOKS_CODEX_TABLE_NAME = "BooksCodexExcelConfigData";
export const DOCUMENT_TABLE_NAME = "DocumentExcelConfigData";
export const LOCALIZATION_TABLE_NAME = "LocalizationExcelConfigData";
export const VIEW_CODEX_TABLE_NAME = "ViewCodexExcelConfigData";
export const QUEST_CODEX_TABLE_NAME = "QuestCodexExcelConfigData";
export const MAIN_QUEST_TABLE_NAME = "MainQuestExcelConfigData";
export const ANIMAL_CODEX_TABLE_NAME = "AnimalCodexExcelConfigData";
export const ANIMAL_DESCRIBE_TABLE_NAME = "AnimalDescribeExcelConfigData";
export const MONSTER_DESCRIBE_TABLE_NAME = "MonsterDescribeExcelConfigData";
export const PUSH_TIPS_CODEX_TABLE_NAME = "PushTipsCodexExcelConfigData";
export const PUSH_TIPS_TABLE_NAME = "PushTipsConfigData";
// The localization kind of a row that names a readable text, as the localization table spells it: a book's body is one
export const LOC_TEXT_ASSET_TYPE = "LOC_TEXT";
// The codex kind of a living being that is an animal, as the codex spells it
export const ANIMAL_CODEX_TYPE = "CODEX_ANIMAL";
// The kind of push tip a tutorial is, as the push tips table spells it: a monster's tip is not a tutorial
export const PUSH_TIPS_TUTORIAL_TYPE = "PUSH_TIPS_TUTORIAL";
// The key each section's slice is published under, after the Archive dataset
export const ArchiveSectionKeyMap: Record<ArchiveSection, string> = {
  [ArchiveSection.Books]: "books",
  [ArchiveSection.Equipment]: "equipment",
  [ArchiveSection.Geography]: "geography",
  [ArchiveSection.LivingBeings]: "livingBeings",
  [ArchiveSection.Materials]: "materials",
  [ArchiveSection.TravelLog]: "travelLog",
  [ArchiveSection.Tutorials]: "tutorials",
};
