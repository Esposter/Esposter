import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { ArchiveSave } from "#src/models/archive/ArchiveSave";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";

// Each section's opened entries read back from the save, every section present however many of its entries are opened
export const toArchiveProgressMap = (progressSave: ArchiveSave["progress"]): ArchiveProgress =>
  new Map(
    Object.values(ArchiveSection).map((section): [ArchiveSection, Set<number>] => [
      section,
      new Set(progressSave[section]),
    ]),
  );
