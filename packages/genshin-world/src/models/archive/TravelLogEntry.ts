import type { ArchiveEntry } from "#src/models/archive/ArchiveEntry";

import { archiveEntrySchema } from "#src/models/archive/ArchiveEntry";
import { z } from "zod";

// A Travel Log entry: an archive entry filed under the main quest it is named for, whose finish opens it
export interface TravelLogEntry extends ArchiveEntry {
  questId: number;
}

export const travelLogEntrySchema = archiveEntrySchema.extend({
  questId: z.int().positive(),
}) satisfies z.ZodType<TravelLogEntry>;
