import type { z } from "zod";

import { messageSchema } from "#shared/models/esbabbler/message";

export const deleteMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true });
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;
