import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";
import type { ToData } from "#shared/models/entity/ToData";

import { messageEntitySchema } from "#shared/models/db/message/MessageEntity";
import {
  MessageMetadataEntity,
  messageMetadataEntitySchema,
} from "#shared/models/db/message/metadata/MessageMetadataEntity";
import { getPropertyNames } from "#shared/util/getPropertyNames";
import { z } from "zod";

export class MessageReplyMetadataEntity extends MessageMetadataEntity {
  message!: string;

  constructor(init?: Partial<MessageReplyMetadataEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const MessageReplyMetadataEntityPropertyNames = getPropertyNames<MessageReplyMetadataEntity>();

export const messageReplyMetadataEntitySchema = messageMetadataEntitySchema.merge(
  z.object({
    message: messageEntitySchema.shape.message,
    messageReplyRowKey: messageEntitySchema.shape.rowKey,
  }),
) satisfies z.ZodType<ToData<MessageReplyMetadataEntity>>;
