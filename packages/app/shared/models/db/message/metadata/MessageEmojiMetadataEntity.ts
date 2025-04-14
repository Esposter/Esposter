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

export const messageEmojiMetadataEntitySchema = createMessageMetadataEntitySchema(
  z.literal(MessageMetadataType.Emoji),
).extend(z.interface({ emojiTag: z.string(), userIds: z.array(selectUserSchema.shape.id) })) satisfies z.ZodType<
  ToData<MessageEmojiMetadataEntity>
>;
