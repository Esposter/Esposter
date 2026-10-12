import type { ArchiveEntry } from "#src/models/archive/ArchiveEntry";

import { archiveEntrySchema } from "#src/models/archive/ArchiveEntry";
import { z } from "zod";

// A Geography entry, a viewpoint: the view codex row that places it in its scene group, named by the group's id and the
// Config id of its gadget within that group, the keys the scene group record files it under
export interface ArchiveViewpoint extends ArchiveEntry {
  configId: number;
  groupId: number;
}

export const archiveViewpointSchema = archiveEntrySchema.extend({
  configId: z.int().positive(),
  groupId: z.int().positive(),
}) satisfies z.ZodType<ArchiveViewpoint>;
