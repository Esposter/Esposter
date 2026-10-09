import type { ArchiveEntry } from "#src/models/archive/ArchiveEntry";

import { archiveEntrySchema } from "#src/models/archive/ArchiveEntry";
import { z } from "zod";

// A volume of the Books section: its entry, the item it is picked up as, and the id of the body its text is read from
export interface ArchiveBook extends ArchiveEntry {
  bodyId: number;
  materialId: number;
}

export const archiveBookSchema = archiveEntrySchema.extend({
  bodyId: z.int().positive(),
  materialId: z.int().positive(),
}) satisfies z.ZodType<ArchiveBook>;
