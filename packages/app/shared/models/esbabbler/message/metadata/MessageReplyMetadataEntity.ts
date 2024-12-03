import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";

import { messageEntitySchema } from "#shared/models/esbabbler/message/MessageEntity";
import {
  MessageMetadataEntity,
  messageMetadataEntitySchema,
} from "#shared/models/esbabbler/message/metadata/MessageMetadataEntity";
import { getPropertyNames } from "#shared/util/getPropertyNames";
import { z } from "zod";

export class MessageReplyMetadataEntity extends MessageMetadataEntity {
  message!: string;

  constructor(init: CompositeKeyEntity & Partial<MessageReplyMetadataEntity>) {
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
) satisfies z.ZodType<MessageReplyMetadataEntity>;
