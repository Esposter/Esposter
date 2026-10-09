import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { ArchiveSection } from "genshin-world";
import { join } from "node:path";

// The game's tables the Archive's sections are read from, in the dump beside its text maps, read by their names
export const WEAPON_CODEX_TABLE_NAME = "WeaponCodexExcelConfigData";
export const WEAPON_TABLE_NAME = "WeaponExcelConfigData";
export const RELIQUARY_CODEX_TABLE_NAME = "ReliquaryCodexExcelConfigData";
export const RELIQUARY_SET_TABLE_NAME = "ReliquarySetExcelConfigData";
export const EQUIP_AFFIX_TABLE_NAME = "EquipAffixExcelConfigData";
export const MATERIAL_CODEX_TABLE_NAME = "MaterialCodexExcelConfigData";
export const MATERIAL_TABLE_NAME = "MaterialExcelConfigData";
export const BOOKS_CODEX_TABLE_NAME = "BooksCodexExcelConfigData";
export const VIEW_CODEX_TABLE_NAME = "ViewCodexExcelConfigData";
export const QUEST_CODEX_TABLE_NAME = "QuestCodexExcelConfigData";
export const MAIN_QUEST_TABLE_NAME = "MainQuestExcelConfigData";
export const ANIMAL_CODEX_TABLE_NAME = "AnimalCodexExcelConfigData";
export const ANIMAL_DESCRIBE_TABLE_NAME = "AnimalDescribeExcelConfigData";
export const MONSTER_DESCRIBE_TABLE_NAME = "MonsterDescribeExcelConfigData";
export const PUSH_TIPS_CODEX_TABLE_NAME = "PushTipsCodexExcelConfigData";
export const PUSH_TIPS_TABLE_NAME = "PushTipsConfigData";
// The codex kind of a living being that is an animal, as the codex spells it
export const ANIMAL_CODEX_TYPE = "CODEX_ANIMAL";
// The kind of push tip a tutorial is, as the push tips table spells it: a monster's tip is not a tutorial
export const PUSH_TIPS_TUTORIAL_TYPE = "PUSH_TIPS_TUTORIAL";
// Where the slices and the names of every language are written, in the world's generated folder they are imported from
export const ARCHIVE_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "archive",
);
export const ARCHIVE_TEXT_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "archiveText",
);
export const ArchiveSectionFileNameMap: Record<ArchiveSection, string> = {
  [ArchiveSection.Books]: "books.json",
  [ArchiveSection.Equipment]: "equipment.json",
  [ArchiveSection.Geography]: "geography.json",
  [ArchiveSection.LivingBeings]: "livingBeings.json",
  [ArchiveSection.Materials]: "materials.json",
  [ArchiveSection.TravelLog]: "travelLog.json",
  [ArchiveSection.Tutorials]: "tutorials.json",
};
