import type { LinkPreviewResponse } from "@/models/message/linkPreview/LinkPreviewResponse";
import type { CompositeKeyEntity, FileEntity, ToData } from "@esposter/shared";
import type { Except } from "type-fest";

import { MessageType } from "@/models/message/MessageType";
import { selectRoomSchema } from "@/schema/rooms";
import { selectUserSchema } from "@/schema/users";
import { refineMessageSchema } from "@/services/message/refineMessageSchema";
import {
  AzureEntity,
  createAzureEntitySchema,
  FILE_MAX_LENGTH,
  fileEntitySchema,
  getPropertyNames,
  MENTION_MAX_LENGTH,
} from "@esposter/shared";
import { z } from "zod";

export const MESSAGE_MAX_LENGTH = 10000;

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
