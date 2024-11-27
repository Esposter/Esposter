import type { CompositeKeyEntity } from "@/shared/models/azure/CompositeKeyEntity";

import { selectUserSchema } from "@/shared/db/schema/users";
import { MessageMetadataEntity, messageMetadataSchema } from "@/shared/models/esbabbler/message/metadata";
import { getPropertyNames } from "@/shared/util/getPropertyNames";
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
