import { CompositeKeyEntity } from "@/models/azure";
import { MessageMetadataEntity, messageMetadataSchema } from "@/models/esbabbler/message/metadata";
import { userSchema } from "@/server/trpc/routers/user";
import { z } from "zod";

export class MessageEmojiMetadataEntity extends MessageMetadataEntity {
  emojiTag!: string;

  userIds!: string[];

  constructor(init: Partial<MessageEmojiMetadataEntity> & CompositeKeyEntity) {
    super();
    Object.assign(this, init);
  }
}

export const messageEmojiMetadataSchema = messageMetadataSchema.merge(
  z.object({ emojiTag: z.string(), userIds: z.array(userSchema.shape.id) }),
) satisfies z.ZodType<MessageEmojiMetadataEntity>;
