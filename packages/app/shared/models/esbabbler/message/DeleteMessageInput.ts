import type { z } from "zod";

import { messageEntitySchema } from "#shared/models/esbabbler/message/MessageEntity";

export const deleteMessageInputSchema = messageEntitySchema.pick({ partitionKey: true, rowKey: true });
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;
