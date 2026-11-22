import type { PageSort } from "@esposter/db-schema";
import type { z } from "zod";

import { createPageInputSchema, selectUserInAuthSchema, SortOrder } from "@esposter/db-schema";

// The accounts a name search matches, by name and then id, so two accounts sharing a name never fall across a page
export const SEARCH_USERS_PAGE_SORT = { keys: ["name", "id"], order: SortOrder.Asc } as const satisfies PageSort;

export const searchUsersInputSchema = createPageInputSchema(SEARCH_USERS_PAGE_SORT).extend({
  name: selectUserInAuthSchema.shape.name,
});
export type SearchUsersInput = z.infer<typeof searchUsersInputSchema>;
