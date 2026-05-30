import type { CompositeKeyEntity } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

import {
  createMessageMetadataEntitySchema,
  MessageMetadataEntity,
  MessageMetadataType,
  userIdsSchema,
} from "@esposter/db-schema";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export class MessageEmojiMetadataEntity extends MessageMetadataEntity<MessageMetadataType.Emoji> {
  emojiTag!: string;
  userIds: string[] = [];

  constructor(init?: Partial<MessageEmojiMetadataEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const MessageEmojiMetadataEntityPropertyNames = getPropertyNames<MessageEmojiMetadataEntity>();

export const messageEmojiMetadataEntitySchema = z.object({
  ...createMessageMetadataEntitySchema(z.literal(MessageMetadataType.Emoji)).shape,
  emojiTag: z.string(),
  ...userIdsSchema.shape,
}) satisfies z.ZodType<ToData<MessageEmojiMetadataEntity>>;
