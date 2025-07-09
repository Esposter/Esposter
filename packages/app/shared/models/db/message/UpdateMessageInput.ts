import type { z } from "zod";

import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import { refineMessageSchema } from "#shared/services/esbabbler/refineMessageSchema";

export const updateMessageInputSchema = refineMessageSchema(
  messageEntitySchema
    .pick({ files: true, message: true, partitionKey: true, rowKey: true })
    .partial({ files: true, message: true }),
);
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
