import type { CompositeKeyEntity } from "@/models/azure";

import { messageSchema } from "@/models/esbabbler/message";
import { MessageMetadataEntity, messageMetadataSchema } from "@/models/esbabbler/message/metadata";
import { getPropertyNames } from "@/services/shared/getPropertyNames";
import { z } from "zod";

export class MessageReplyMetadataEntity extends MessageMetadataEntity {
  message!: string;

  constructor(init: CompositeKeyEntity & Partial<MessageReplyMetadataEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const MessageReplyMetadataEntityPropertyNames = getPropertyNames<MessageReplyMetadataEntity>();

export const messageReplyMetadataSchema = messageMetadataSchema.merge(
  z.object({
    message: messageSchema.shape.message,
    messageReplyRowKey: messageSchema.shape.rowKey,
  }),
) satisfies z.ZodType<MessageReplyMetadataEntity>;
