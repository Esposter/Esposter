import type { TravelLogEntry } from "#src/models/archive/TravelLogEntry";

import { travelLogEntrySchema } from "#src/models/archive/TravelLogEntry";
import { z } from "zod";

// The Travel Log's entries, the slice `pnpm -C scripts genshin:assets archive` writes, imported on demand and checked
// Against its shape as it arrives
export const readTravelLogEntries = async (): Promise<TravelLogEntry[]> => {
  const { default: entries } = await import("#src/generated/archive/travelLog.json");
  return z.array(travelLogEntrySchema).parse(entries);
};
