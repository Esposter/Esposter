import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { Tip } from "#src/models/tip/Tip";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { openArchiveEntry } from "#src/services/archive/openArchiveEntry";

// The progress with a tutorial's entry opened as its tip is shown. A tip the Archive does not list has no entry to open, so
// The progress given is returned as it was
export const openTipArchiveEntry = (progress: ArchiveProgress, tip: Tip): ArchiveProgress =>
  tip.codexId === undefined ? progress : openArchiveEntry(progress, ArchiveSection.Tutorials, tip.codexId);
