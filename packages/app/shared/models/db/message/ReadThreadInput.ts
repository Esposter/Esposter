import { selectRoomInMessageSchema, standardMessageEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const readThreadInputSchema = z.object({
  roomId: selectRoomInMessageSchema.shape.id,
  rootRowKey: standardMessageEntitySchema.shape.rowKey,
});
export type ReadThreadInput = z.infer<typeof readThreadInputSchema>;
