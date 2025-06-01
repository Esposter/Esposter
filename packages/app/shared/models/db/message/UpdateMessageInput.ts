import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { refineMessageSchema } from "#shared/services/esbabbler/refineMessageSchema";
import { z } from "zod/v4";

export const updateMessageInputSchema = refineMessageSchema(
  z.object({
    ...messageEntitySchema.pick({ partitionKey: true, rowKey: true }).shape,
    ...messageEntitySchema.pick({ files: true, message: true }).partial().shape,
  }),
);
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
