import type { z } from "zod";

import { messageEmojiMetadataEntitySchema } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";

export const updateEmojiInputSchema = messageEmojiMetadataEntitySchema.pick({ partitionKey: true, rowKey: true });
export type UpdateEmojiInput = z.infer<typeof updateEmojiInputSchema>;
