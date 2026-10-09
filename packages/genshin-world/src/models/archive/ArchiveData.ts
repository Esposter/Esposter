import type { ArchiveSectionEntriesMap } from "#src/models/archive/ArchiveSectionEntriesMap";

// The Archive's entries by section and their names in the reader's language, read once the quest it opens after is done
export interface ArchiveData {
  sectionEntriesMap: ArchiveSectionEntriesMap;
  textMap: Readonly<Record<string, string>>;
}
