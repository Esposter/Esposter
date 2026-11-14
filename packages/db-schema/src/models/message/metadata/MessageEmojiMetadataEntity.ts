import type { CompositeKeyEntity } from "#src/models/shared/CompositeKeyEntity";
import type { ToData } from "@esposter/shared";

import { emojiTagSchema } from "#src/models/message/emoji/EmojiTag";
import { MessageMetadataEntity } from "#src/models/message/metadata/MessageMetadataEntity";
import { MessageMetadataType } from "#src/models/message/metadata/MessageMetadataType";
import { userIdsSchema } from "#src/models/shared/UserIds";
import { createMessageMetadataEntitySchema } from "#src/services/message/metadata/createMessageMetadataEntitySchema";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export class MessageEmojiMetadataEntity extends MessageMetadataEntity<MessageMetadataType.Emoji> {
  declare emojiTag: string;
  userIds: string[] = [];

  constructor(init?: Partial<MessageEmojiMetadataEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const MessageEmojiMetadataEntityPropertyNames = getPropertyNames<MessageEmojiMetadataEntity>();

export const messageEmojiMetadataEntitySchema = z.object({
  ...createMessageMetadataEntitySchema(z.literal(MessageMetadataType.Emoji)).shape,
  emojiTag: emojiTagSchema,
  ...userIdsSchema.shape,
}) satisfies z.ZodType<ToData<MessageEmojiMetadataEntity>>;
