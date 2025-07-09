import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";
import type { ToData } from "#shared/models/entity/ToData";

import { selectUserSchema } from "#shared/db/schema/users";
import {
    createMessageMetadataEntitySchema,
    MessageMetadataEntity,
} from "#shared/models/db/message/metadata/MessageMetadataEntity";
import { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import { getPropertyNames } from "#shared/util/getPropertyNames";
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
