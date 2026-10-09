import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { GameTextKey } from "genshin-text";

// Each section's title in the game's words, which the Archive's tabs show
export const ArchiveSectionGameTextKeyMap: Readonly<Record<ArchiveSection, GameTextKey>> = {
  [ArchiveSection.Books]: GameTextKey.ArchiveBooks,
  [ArchiveSection.Equipment]: GameTextKey.ArchiveEquipment,
  [ArchiveSection.Geography]: GameTextKey.ArchiveGeography,
  [ArchiveSection.LivingBeings]: GameTextKey.ArchiveLivingBeings,
  [ArchiveSection.Materials]: GameTextKey.ArchiveMaterials,
  [ArchiveSection.TravelLog]: GameTextKey.ArchiveTravelLog,
  [ArchiveSection.Tutorials]: GameTextKey.ArchiveTutorials,
};
