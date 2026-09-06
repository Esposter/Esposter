import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { roomIdSchema, selectUserSchema } from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";
import { z } from "zod";

export const readMembersInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(selectUserSchema.keyof(), [
    { key: ItemMetadataPropertyNames.updatedAt, order: SortOrder.Desc },
  ]).shape,
  filter: selectUserSchema.pick({ name: true }).optional(),
});
export type ReadMembersInput = z.infer<typeof readMembersInputSchema>;
