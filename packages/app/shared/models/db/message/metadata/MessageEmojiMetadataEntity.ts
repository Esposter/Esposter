import type { CompositeKeyEntity } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

import {
  createMessageMetadataEntitySchema,
  MessageMetadataEntity,
  MessageMetadataType,
  selectUserSchema,
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
  userIds: selectUserSchema.shape.id.array(),
}) satisfies z.ZodType<ToData<MessageEmojiMetadataEntity>>;
