import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";
import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { LinkPreviewResponse } from "#shared/models/message/linkPreview/LinkPreviewResponse";
import type { Except } from "type-fest";

import { selectRoomSchema } from "#shared/db/schema/rooms";
import { selectUserSchema } from "#shared/db/schema/users";
import { AzureEntity, createAzureEntitySchema } from "#shared/models/azure/AzureEntity";
import { fileEntitySchema } from "#shared/models/azure/FileEntity";
import { MessageType } from "#shared/models/db/message/MessageType";
import { FILE_MAX_LENGTH } from "#shared/services/azure/container/constants";
import { MENTION_MAX_LENGTH, MESSAGE_MAX_LENGTH } from "#shared/services/message/constants";
import { refineMessageSchema } from "#shared/services/message/refineMessageSchema";
import { getPropertyNames } from "#shared/util/getPropertyNames";
import { z } from "zod";

export class MessageEntity extends AzureEntity {
  files: FileEntity[] = [];
  isEdited?: true;
  isForward?: true;
  // Only used by the frontend for visual effects
  isLoading?: true;
  isPinned?: true;
  linkPreviewResponse: LinkPreviewResponse | null = null;
  mentions: string[] = [];
  message!: string;
  replyRowKey?: string;
  type = MessageType.Message;
  userId!: string;

  constructor(init?: Partial<MessageEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const MessageEntityPropertyNames = getPropertyNames<MessageEntity>();

export const messageEntitySchema = refineMessageSchema(
  z.object({
    ...createAzureEntitySchema(
      z.object({
        partitionKey: selectRoomSchema.shape.id,
        // reverse-ticked timestamp
        rowKey: z.string(),
      }),
    ).shape,
    files: fileEntitySchema.array().max(FILE_MAX_LENGTH).default([]),
    isEdited: z.literal(true).optional(),
    isForward: z.literal(true).optional(),
    isPinned: z.literal(true).optional(),
    mentions: selectUserSchema.shape.id.array().max(MENTION_MAX_LENGTH).default([]),
    message: z.string().max(MESSAGE_MAX_LENGTH).default(""),
    replyRowKey: z.string().optional(),
    type: z.enum(MessageType).default(MessageType.Message),
    userId: selectUserSchema.shape.id,
  }),
  // We only generate link preview responses via the backend, so we can safely exclude it from the schema
) satisfies z.ZodType<ToData<Except<MessageEntity, "linkPreviewResponse">>>;
