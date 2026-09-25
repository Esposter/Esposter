import { z } from "zod";

// How the reader laid the sheet's table out, kept beside how its file is read: each column's width in px by the column's
// Id, so a rename keeps it, and by its key for a column the table draws of its own. Absent until a column is resized
export interface SheetLayoutSettings {
  columnIdWidthMap?: Record<string, number>;
}

export const sheetLayoutSettingsSchema = z.object({
  columnIdWidthMap: z.record(z.string(), z.int().positive()).optional(),
}) satisfies z.ZodType<SheetLayoutSettings>;
