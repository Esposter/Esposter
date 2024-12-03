import type { z } from "zod";

import { messageSchema } from "#shared/models/esbabbler/message";

export const updateMessageInputSchema = messageSchema.pick({ message: true, partitionKey: true, rowKey: true });
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
