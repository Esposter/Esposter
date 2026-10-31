import type { ArchiveSectionEntriesMap } from "#src/models/archive/ArchiveSectionEntriesMap";

import { archiveBookSchema } from "#src/models/archive/ArchiveBook";
import { archiveEntrySchema } from "#src/models/archive/ArchiveEntry";
import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { archiveViewpointSchema } from "#src/models/archive/ArchiveViewpoint";
import { readTravelLogEntries } from "#src/services/archive/readTravelLogEntries";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

const archiveEntriesSchema = z.array(archiveEntrySchema);

// Every section's entries, which `pnpm -C scripts genshin:assets archive` writes.
// Each is fetched by its key from the hosted game data and checked against its shape as it arrives
export const readArchiveEntries = async (gameDataBaseUrl: string): Promise<ArchiveSectionEntriesMap> => {
  const [books, equipment, geography, livingBeings, materials, travelLog, tutorials] = await Promise.all([
    readGameData(gameDataBaseUrl, "archive/books", z.array(archiveBookSchema)),
    readGameData(gameDataBaseUrl, "archive/equipment", archiveEntriesSchema),
    readGameData(gameDataBaseUrl, "archive/geography", z.array(archiveViewpointSchema)),
    readGameData(gameDataBaseUrl, "archive/livingBeings", archiveEntriesSchema),
    readGameData(gameDataBaseUrl, "archive/materials", archiveEntriesSchema),
    readTravelLogEntries(gameDataBaseUrl),
    readGameData(gameDataBaseUrl, "archive/tutorials", archiveEntriesSchema),
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
