import type { TravelLogEntry } from "#src/models/archive/TravelLogEntry";

import { travelLogEntrySchema } from "#src/models/archive/TravelLogEntry";
import { readGameData } from "#src/services/data/readGameData";
import { z } from "zod";

// The Travel Log's entries, the slice `pnpm -C scripts genshin:assets archive` writes, fetched by its key and checked
// Against its shape as it arrives
export const readTravelLogEntries = (gameDataBaseUrl: string): Promise<TravelLogEntry[]> =>
  readGameData(gameDataBaseUrl, "archive/travelLog", z.array(travelLogEntrySchema));
