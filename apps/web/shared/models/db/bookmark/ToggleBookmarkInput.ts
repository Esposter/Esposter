import { pageMarkSchema } from "#shared/models/app/PageMark";
import { selectBookmarkSchema } from "@esposter/db-schema";
import { z } from "zod";

export const toggleBookmarkInputSchema = z.object({
  ...selectBookmarkSchema.pick({ path: true, title: true }).shape,
  mark: pageMarkSchema.optional(),
});
export type ToggleBookmarkInput = z.infer<typeof toggleBookmarkInputSchema>;
