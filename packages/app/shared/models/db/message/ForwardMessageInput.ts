import { roomIdsSchema, standardMessageEntitySchema } from "@esposter/db-schema";
import { z } from "zod";

export const forwardMessageInputSchema = z.object({
  ...standardMessageEntitySchema.pick({ message: true, partitionKey: true, rowKey: true }).shape,
  roomIds: roomIdsSchema.shape.roomIds.min(1),
});
export type ForwardMessageInput = z.infer<typeof forwardMessageInputSchema>;
