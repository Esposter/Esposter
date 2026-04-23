import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { roomIdSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readBansInputSchema = z.object({
  ...roomIdSchema.shape,
  ...createCursorPaginationParamsSchema(z.string(), []).omit({ sortBy: true }).shape,
});
export type ReadBansInput = z.infer<typeof readBansInputSchema>;
