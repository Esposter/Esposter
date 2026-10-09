import type { ArchiveSectionEntriesMap } from "#src/models/archive/ArchiveSectionEntriesMap";

import { archiveBookSchema } from "#src/models/archive/ArchiveBook";
import { archiveEntrySchema } from "#src/models/archive/ArchiveEntry";
import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { readTravelLogEntries } from "#src/services/archive/readTravelLogEntries";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// Every section's entries, which `pnpm -C scripts genshin:assets archive` writes.
// Each is fetched by its key from the hosted game data and checked against its shape as it arrives
export const readArchiveEntries = async (gameDataBaseUrl: string): Promise<ArchiveSectionEntriesMap> => {
  const [books, equipment, geography, livingBeings, materials, travelLog, tutorials] = await Promise.all([
    readGameData(gameDataBaseUrl, "archive/books", z.array(archiveBookSchema)),
    readGameData(gameDataBaseUrl, "archive/equipment", z.array(archiveEntrySchema)),
    readGameData(gameDataBaseUrl, "archive/geography", z.array(archiveEntrySchema)),
    readGameData(gameDataBaseUrl, "archive/livingBeings", z.array(archiveEntrySchema)),
    readGameData(gameDataBaseUrl, "archive/materials", z.array(archiveEntrySchema)),
    readTravelLogEntries(gameDataBaseUrl),
    readGameData(gameDataBaseUrl, "archive/tutorials", z.array(archiveEntrySchema)),
  ]);
  return {
    [ArchiveSection.Books]: books,
    [ArchiveSection.Equipment]: equipment,
    [ArchiveSection.Geography]: geography,
    [ArchiveSection.LivingBeings]: livingBeings,
    [ArchiveSection.Materials]: materials,
    [ArchiveSection.TravelLog]: travelLog,
    [ArchiveSection.Tutorials]: tutorials,
  };
};
