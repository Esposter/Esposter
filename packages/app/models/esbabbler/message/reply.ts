import type { CompositeKeyEntity } from "@/models/azure";
import { messageSchema } from "@/models/esbabbler/message";
import { MessageMetadataEntity, messageMetadataSchema } from "@/models/esbabbler/message/metadata";
import { getPropertyNames } from "@/services/shared/getPropertyNames";
import { z } from "zod";

export class MessageReplyMetadataEntity extends MessageMetadataEntity {
  messageReplyRowKey!: string;

  constructor(init: Partial<MessageReplyMetadataEntity> & CompositeKeyEntity) {
    super();
    Object.assign(this, init);
  }
}

export const MessageReplyMetadataEntityPropertyNames = getPropertyNames<MessageReplyMetadataEntity>();

export const messageReplyMetadataSchema = z
  .object({ messageReplyRowKey: messageSchema.shape.rowKey })
  .merge(messageMetadataSchema) satisfies z.ZodType<MessageReplyMetadataEntity>;
