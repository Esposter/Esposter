import { ArchiveSection } from "genshin-world";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
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
// The codex kind of a living being that is an animal, as the codex spells it. A monster is the other kind, whose name the
// Dump does not carry, so the section lists only the animals
export const ANIMAL_CODEX_TYPE = "CODEX_ANIMAL";
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
  [ArchiveSection.Equipment]: "equipment.json",
  [ArchiveSection.LivingBeings]: "livingBeings.json",
  [ArchiveSection.Tutorials]: "tutorials.json",
  [ArchiveSection.Geography]: "geography.json",
  [ArchiveSection.TravelLog]: "travelLog.json",
  [ArchiveSection.Books]: "books.json",
  [ArchiveSection.Materials]: "materials.json",
};
