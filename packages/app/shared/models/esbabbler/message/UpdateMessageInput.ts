import type { z } from "zod";

import { messageEntitySchema } from "#shared/models/esbabbler/message/MessageEntity";

export const updateMessageInputSchema = messageEntitySchema.pick({ message: true, partitionKey: true, rowKey: true });
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
