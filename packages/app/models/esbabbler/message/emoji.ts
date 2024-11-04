import type { CompositeKeyEntity } from "@/models/azure";

import { MessageMetadataEntity, messageMetadataSchema } from "@/models/esbabbler/message/metadata";
import { selectUserSchema } from "@/server/db/schema/users";
import { getPropertyNames } from "@/services/shared/getPropertyNames";
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

export const messageEmojiMetadataSchema = messageMetadataSchema.merge(
  z.object({ emojiTag: z.string(), userIds: z.array(selectUserSchema.shape.id) }),
) satisfies z.ZodType<MessageEmojiMetadataEntity>;
