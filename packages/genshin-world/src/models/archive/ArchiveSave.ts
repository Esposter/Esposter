import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { MAX_ARCHIVE_ENTRY_COUNT, MAX_ARCHIVE_KILL_COUNT, MAX_SAVE_ID_LENGTH } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The Archive as the save holds it: the ids of the entries each section has opened, each section by its name, and the
// Defeats of each Living Being counted under its entry's id
export const archiveSaveSchema = z.object({
  kills: z
    .record(z.string().min(1).max(MAX_SAVE_ID_LENGTH), z.int().positive())
    .refine((killMap) => Object.keys(killMap).length <= MAX_ARCHIVE_KILL_COUNT, "Too many Living Beings"),
  progress: z.record(z.enum(ArchiveSection), createUniqueArraySchema(z.int().positive()).max(MAX_ARCHIVE_ENTRY_COUNT)),
});

export type ArchiveSave = z.infer<typeof archiveSaveSchema>;
