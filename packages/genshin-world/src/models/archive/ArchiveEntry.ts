import { z } from "zod";

// One entry of a section as its codex table lists it: the table's id for the entry, the text id of its name, and where its
// Table holds one the text id of its description, which the world's own chunk of each language holds beside the name
export interface ArchiveEntry {
  descriptionTextId?: string;
  id: number;
  nameTextId: string;
}

export const archiveEntrySchema = z.object({
  descriptionTextId: z.string().min(1).optional(),
  id: z.int().positive(),
  nameTextId: z.string().min(1),
}) satisfies z.ZodType<ArchiveEntry>;
