import { ArchiveSection } from "#src/models/archive/ArchiveSection";

// The sections in the order the game lists them down the Archive's tabs. It is written out, since lint sorts an enum's
// Members into alphabetical order
export const ArchiveSectionOrder: readonly ArchiveSection[] = [
  ArchiveSection.Equipment,
  ArchiveSection.LivingBeings,
  ArchiveSection.Tutorials,
  ArchiveSection.Geography,
  ArchiveSection.TravelLog,
  ArchiveSection.Books,
  ArchiveSection.Materials,
];
