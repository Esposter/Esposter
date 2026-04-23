import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { selectRoomSchema } from "@esposter/db-schema";
import { z } from "zod";

export const readModerationLogInputSchema = z.object({
  ...createCursorPaginationParamsSchema(z.string(), []).omit({ sortBy: true }).shape,
  roomId: selectRoomSchema.shape.id,
});
export type ReadModerationLogInput = z.infer<typeof readModerationLogInputSchema>;
