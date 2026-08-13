import { roomIdSchema, standardMessageEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const followThreadInputSchema = z.object({
  ...roomIdSchema.shape,
  threadRootRowKey: standardMessageEntitySchema.shape.rowKey,
});
export type FollowThreadInput = z.infer<typeof followThreadInputSchema>;
