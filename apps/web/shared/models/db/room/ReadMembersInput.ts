import type { PageSort } from "@esposter/db-schema";

import { MEMBER_DISPLAY_NAME_KEY } from "#shared/services/room/constants";
import { createPageInputSchema, roomIdSchema, selectUserInAuthSchema, SortOrder } from "@esposter/db-schema";
import { z } from "zod";

// A display name is not unique, so the id breaks its ties and a cursor never skips one of two equal names. The name is
// Compared without regard to ASCII case, so the server binds it with COLLATE NOCASE
export const readMembersPageSort = {
  keys: [MEMBER_DISPLAY_NAME_KEY, "id"],
  order: SortOrder.Asc,
} as const satisfies PageSort<"id" | typeof MEMBER_DISPLAY_NAME_KEY>;

export const readMembersInputSchema = z
  .object({ ...roomIdSchema.shape, filter: selectUserInAuthSchema.pick({ name: true }).optional() })
  .extend(createPageInputSchema(readMembersPageSort).shape);
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;
