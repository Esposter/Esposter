import type { ArchiveBook } from "#src/models/archive/ArchiveBook";
import type { ArchiveEntry } from "#src/models/archive/ArchiveEntry";
import type { ArchiveSection } from "#src/models/archive/ArchiveSection";

// Every section's entries in the codex's order, the Books' volumes each with the item it is picked up as and its body
export type ArchiveSectionEntriesMap = Record<Exclude<ArchiveSection, ArchiveSection.Books>, ArchiveEntry[]> &
  Record<ArchiveSection.Books, ArchiveBook[]>;
