import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";

import { selectUserSchema } from "#shared/db/schema/users";
import {
  MessageMetadataEntity,
  messageMetadataEntitySchema,
} from "#shared/models/db/message/metadata/MessageMetadataEntity";
import { getPropertyNames } from "#shared/util/getPropertyNames";
import { z } from "zod";

export class MessageEmojiMetadataEntity extends MessageMetadataEntity {
  emojiTag!: string;

  userIds!: string[];

  constructor(init: CompositeKeyEntity & Partial<MessageEmojiMetadataEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const MessageEmojiMetadataEntityPropertyNames = getPropertyNames<MessageEmojiMetadataEntity>();

export const messageEmojiMetadataEntitySchema = messageMetadataEntitySchema.merge(
  z.object({ emojiTag: z.string(), userIds: z.array(selectUserSchema.shape.id) }),
) as const satisfies z.ZodType<MessageEmojiMetadataEntity>;
