import type { ArchiveBook } from "#src/models/archive/ArchiveBook";
import type { ArchiveEntry } from "#src/models/archive/ArchiveEntry";
import type { ArchiveSection } from "#src/models/archive/ArchiveSection";
import type { ArchiveViewpoint } from "#src/models/archive/ArchiveViewpoint";

// Every section's entries in the codex's order, the Books' volumes each with the item it is picked up as and its body,
// And the Geography's viewpoints each with the group and config id that place it
export type ArchiveSectionEntriesMap = Record<ArchiveSection.Books, ArchiveBook[]> &
  Record<ArchiveSection.Geography, ArchiveViewpoint[]> &
  Record<Exclude<ArchiveSection, ArchiveSection.Books | ArchiveSection.Geography>, ArchiveEntry[]>;
