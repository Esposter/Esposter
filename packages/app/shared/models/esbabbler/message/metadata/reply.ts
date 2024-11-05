import type { CompositeKeyEntity } from "@/shared/models/azure/CompositeKeyEntity";

import { messageSchema } from "@/shared/models/esbabbler/message";
import { MessageMetadataEntity, messageMetadataSchema } from "@/shared/models/esbabbler/message/metadata";
import { getPropertyNames } from "@/shared/utils/getPropertyNames";
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
