import type { z } from "zod";

import { selectBookmarkSchema } from "@esposter/db-schema";

export const toggleBookmarkInputSchema = selectBookmarkSchema.pick({ path: true, title: true });
export type ToggleBookmarkInput = z.infer<typeof toggleBookmarkInputSchema>;
