import type { z } from "zod";

import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
// @TODO: oneOf([files, message])
export const updateMessageInputSchema = messageEntitySchema
  .pick({
    files: true,
    message: true,
    partitionKey: true,
    rowKey: true,
  })
  // @TODO: We shouldn't need to explicitly mark these fields as partial
  // since they already have defaults... zod 4 please
  .partial({ files: true, message: true });
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;
