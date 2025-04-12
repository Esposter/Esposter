import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { Type } from "arktype";

import { selectUserSchema } from "#shared/db/schema/users";
import {
  createMessageMetadataEntitySchema,
  MessageMetadataEntity,
} from "#shared/models/db/message/metadata/MessageMetadataEntity";
import { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import { getPropertyNames } from "#shared/util/getPropertyNames";
import { type } from "arktype";

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
  type.enumerated(MessageMetadataType.Emoji),
).merge(type({ emojiTag: "string", userIds: selectUserSchema.get("id").array() })) satisfies Type<
  ToData<MessageEmojiMetadataEntity>
>;
