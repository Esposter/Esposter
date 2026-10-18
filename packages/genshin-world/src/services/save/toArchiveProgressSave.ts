import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { ArchiveSave } from "#src/models/archive/ArchiveSave";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";

// The opened entries of each section, every section saved even while none of its entries is opened
export const toArchiveProgressSave = (archiveProgressMap: ArchiveProgress): ArchiveSave["progress"] =>
  Object.fromEntries(
    Object.values(ArchiveSection).map((section) => [section, [...(archiveProgressMap.get(section) ?? [])]]),
  );
