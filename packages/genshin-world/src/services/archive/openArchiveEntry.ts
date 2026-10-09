import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { ArchiveSection } from "#src/models/archive/ArchiveSection";

// The progress with one entry of a section opened, as a defeat or a bag's item opens it. An entry already open stays open,
// And the progress given is left as it was
export const openArchiveEntry = (
  progress: ArchiveProgress,
  section: ArchiveSection,
  entryId: number,
): ArchiveProgress => new Map(progress).set(section, new Set(progress.get(section)).add(entryId));
