import type { PageSort } from "@esposter/db-schema";
import type { z } from "zod";

import { createPageInputSchema, SortOrder } from "@esposter/db-schema";

// The stars a page answers, the most recently set first, and the resource's id breaking the ties of stars set together
export const FAVORITE_PAGE_SORT = {
  keys: ["createdAt", "resourceId"],
  order: SortOrder.Desc,
} as const satisfies PageSort;

export const readFavoritesInputSchema = createPageInputSchema(FAVORITE_PAGE_SORT).prefault({});
export type ReadFavoritesInput = z.infer<typeof readFavoritesInputSchema>;
