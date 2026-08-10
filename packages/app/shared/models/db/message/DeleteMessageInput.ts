import type { z } from "zod";

import { messageCompositeKeySchema } from "#shared/models/db/message/MessageCompositeKey";

export const deleteMessageInputSchema = messageCompositeKeySchema;
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;
