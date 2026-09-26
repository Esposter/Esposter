import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { z } from "zod";

// How the reader laid the sheet's table out, kept beside how its file is read: each column's width in px by the column's
// Id, so a rename keeps it, and by its key for a column the table draws of its own. Absent until a column is resized
export interface SheetLayoutSettings {
  columnIdWidthMap?: Record<string, number>;
}

export const sheetLayoutSettingsSchema = z.object({
  columnIdWidthMap: z.record(z.string().max(MAX_RESOURCE_CONTENT_SIZE), z.int().positive()).optional(),
}) satisfies z.ZodType<SheetLayoutSettings>;
