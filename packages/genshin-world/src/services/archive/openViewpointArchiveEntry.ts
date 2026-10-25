import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { openArchiveEntry } from "#src/services/archive/openArchiveEntry";

// The progress with a viewpoint's entry opened as the player views it at its place
export const openViewpointArchiveEntry = (progress: ArchiveProgress, viewpointId: number): ArchiveProgress =>
  openArchiveEntry(progress, ArchiveSection.Geography, viewpointId);
