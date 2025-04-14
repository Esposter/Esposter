import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";
import type { ToData } from "#shared/models/entity/ToData";

import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import {
  createMessageMetadataEntitySchema,
  MessageMetadataEntity,
} from "#shared/models/db/message/metadata/MessageMetadataEntity";
import { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import { getPropertyNames } from "#shared/util/getPropertyNames";
import { z } from "zod";

export class MessageReplyMetadataEntity extends MessageMetadataEntity<MessageMetadataType.Reply> {
  message!: string;

  constructor(init?: Partial<MessageReplyMetadataEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const MessageReplyMetadataEntityPropertyNames = getPropertyNames<MessageReplyMetadataEntity>();

export const messageReplyMetadataEntitySchema = createMessageMetadataEntitySchema(
  z.literal(MessageMetadataType.Reply),
).extend(
  z.object({
    message: messageEntitySchema.shape.message,
    messageReplyRowKey: messageEntitySchema.shape.rowKey,
  }),
) satisfies z.ZodType<ToData<MessageReplyMetadataEntity>>;
