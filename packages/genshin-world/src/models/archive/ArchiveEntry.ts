import { z } from "zod";

// One entry of a section as its codex table lists it: the table's id for the entry, and the text id of its name, which
// The world's own chunk of each language holds
export interface ArchiveEntry {
  id: number;
  nameTextId: string;
}

export const archiveEntrySchema = z.object({
  id: z.int().positive(),
  nameTextId: z.string().min(1),
}) satisfies z.ZodType<ArchiveEntry>;
