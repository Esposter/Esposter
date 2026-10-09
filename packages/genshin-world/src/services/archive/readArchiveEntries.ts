import type { ArchiveEntry } from "#src/models/archive/ArchiveEntry";

import { archiveEntrySchema } from "#src/models/archive/ArchiveEntry";
import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { z } from "zod";

// Every section's entries, the slices `pnpm -C scripts genshin:assets archive` writes, imported on demand as chunks of
// Their own and checked against their shape as they arrive
export const readArchiveEntries = async (): Promise<Record<ArchiveSection, ArchiveEntry[]>> => {
  const [books, equipment, geography, livingBeings, materials, travelLog, tutorials] = await Promise.all([
    import("#src/generated/archive/books.json"),
    import("#src/generated/archive/equipment.json"),
    import("#src/generated/archive/geography.json"),
    import("#src/generated/archive/livingBeings.json"),
    import("#src/generated/archive/materials.json"),
    import("#src/generated/archive/travelLog.json"),
    import("#src/generated/archive/tutorials.json"),
  ]);
  return {
    [ArchiveSection.Books]: z.array(archiveEntrySchema).parse(books.default),
    [ArchiveSection.Equipment]: z.array(archiveEntrySchema).parse(equipment.default),
    [ArchiveSection.Geography]: z.array(archiveEntrySchema).parse(geography.default),
    [ArchiveSection.LivingBeings]: z.array(archiveEntrySchema).parse(livingBeings.default),
    [ArchiveSection.Materials]: z.array(archiveEntrySchema).parse(materials.default),
    [ArchiveSection.TravelLog]: z.array(archiveEntrySchema).parse(travelLog.default),
    [ArchiveSection.Tutorials]: z.array(archiveEntrySchema).parse(tutorials.default),
  };
};
