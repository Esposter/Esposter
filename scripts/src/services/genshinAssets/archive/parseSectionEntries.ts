import type { ArchiveEntry } from "genshin-world";

import {
  archiveBookSchema,
  archiveEntrySchema,
  ArchiveSection,
  archiveViewpointSchema,
  travelLogEntrySchema,
} from "genshin-world";

// Each section's entries checked against the world's schema for it, which keeps the fields its own entries carry
export const parseSectionEntries = (section: ArchiveSection, entries: readonly ArchiveEntry[]): ArchiveEntry[] => {
  if (section === ArchiveSection.Books) return archiveBookSchema.array().parse(entries);
  if (section === ArchiveSection.Geography) return archiveViewpointSchema.array().parse(entries);
  if (section === ArchiveSection.TravelLog) return travelLogEntrySchema.array().parse(entries);
  return archiveEntrySchema.array().parse(entries);
};
