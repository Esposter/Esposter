import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { roomIdSchema, selectBanInMessageSchema } from "@esposter/db-schema";
import { ItemMetadataPropertyNames } from "@esposter/shared";
import { z } from "zod";

export const readBansInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(selectBanInMessageSchema.keyof(), [
    { key: ItemMetadataPropertyNames.createdAt, order: SortOrder.Desc },
  ]).omit({ sortBy: true }).shape,
});
export type ReadBansInput = z.infer<typeof readBansInputSchema>;
