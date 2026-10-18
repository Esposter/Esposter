import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { ArchiveSave } from "#src/models/archive/ArchiveSave";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";

// The opened entries of each section, every section saved even while none of its entries is opened
export const toArchiveProgressSave = (archiveProgressMap: ArchiveProgress): ArchiveSave["progress"] => ({
  [ArchiveSection.Books]: [...(archiveProgressMap.get(ArchiveSection.Books) ?? [])],
  [ArchiveSection.Equipment]: [...(archiveProgressMap.get(ArchiveSection.Equipment) ?? [])],
  [ArchiveSection.Geography]: [...(archiveProgressMap.get(ArchiveSection.Geography) ?? [])],
  [ArchiveSection.LivingBeings]: [...(archiveProgressMap.get(ArchiveSection.LivingBeings) ?? [])],
  [ArchiveSection.Materials]: [...(archiveProgressMap.get(ArchiveSection.Materials) ?? [])],
  [ArchiveSection.TravelLog]: [...(archiveProgressMap.get(ArchiveSection.TravelLog) ?? [])],
  [ArchiveSection.Tutorials]: [...(archiveProgressMap.get(ArchiveSection.Tutorials) ?? [])],
});
