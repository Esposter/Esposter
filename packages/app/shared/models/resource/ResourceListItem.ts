import type { Resource } from "@esposter/db-schema";

import { selectResourceSchema } from "@esposter/db-schema";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

// One list row: the resource, plus when the *caller* last opened it. Last accessed is joined rather than
// Stored on the row because it is per-user — the workbench offers it as a column, and Recent sorts by it.
// Every list read joins it, so the field is always present; null means this user has never opened the row.
export interface ResourceListItem extends Resource {
  lastAccessedAt: Date | null;
}

export const ResourceListItemPropertyNames = getPropertyNames<ResourceListItem>();
// What a resource list may be ordered by, shared so the procedure input, the deep-linked `?sortBy=` param and
// The table headers can never disagree about which keys exist
export const resourceListSortKeySchema: z.ZodType<keyof ResourceListItem> = z.union([
  selectResourceSchema.keyof(),
  z.literal(ResourceListItemPropertyNames.lastAccessedAt),
]);
