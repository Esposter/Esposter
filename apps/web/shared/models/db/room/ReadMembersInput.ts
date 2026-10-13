import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { PublicUserColumns, roomIdSchema, selectUserInAuthSchema } from "@esposter/db-schema";
import { z } from "zod";

// The name a member is listed, searched and paged by: the nickname when there is one, else the global name
export const MEMBER_DISPLAY_NAME_KEY = "displayName";

export const readMembersInputSchema = z.object({
  ...roomIdSchema.shape,
  // A display name is not unique, so the id breaks its ties and a cursor never skips one of two equal names
  ...createCursorPaginationParamsSchema(
    z.union([selectUserInAuthSchema.pick(PublicUserColumns).keyof(), z.literal(MEMBER_DISPLAY_NAME_KEY)]),
    [
      { key: MEMBER_DISPLAY_NAME_KEY, order: SortOrder.Asc },
      { key: "id", order: SortOrder.Asc },
    ],
  ).shape,
  filter: selectUserInAuthSchema.pick({ name: true }).optional(),
});
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;
