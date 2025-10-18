import type { FileEntity } from "@/models/azure/table/FileEntity";
import type { LinkPreviewResponse } from "@/models/message/linkPreview/LinkPreviewResponse";
import type { ItemEntityType, ToData } from "@esposter/shared";
import type { Except } from "type-fest";

import { AzureEntity, createAzureEntitySchema } from "@/models/azure/table/AzureEntity";
import { fileEntitySchema } from "@/models/azure/table/FileEntity";
import { MessageType } from "@/models/message/MessageType";
import { selectRoomSchema } from "@/schema/rooms";
import { selectUserSchema } from "@/schema/users";
import { FILE_MAX_LENGTH } from "@/services/azure/container/constants";
import { z } from "zod";

export const MENTION_MAX_LENGTH = 100;
export const MESSAGE_MAX_LENGTH = 10000;

export class BaseMessageEntity<TType extends MessageType = Exclude<MessageType, MessageType.Webhook>>
  extends AzureEntity
  implements ItemEntityType<TType>
{
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
  type!: TType;
}

export const baseMessageEntitySchema = z.object({
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
  type: z.enum(Object.values(MessageType).filter((type) => type !== MessageType.Webhook)).default(MessageType.Message),
  userId: selectUserSchema.shape.id,
}) satisfies z.ZodType<ToData<Except<BaseMessageEntity, "linkPreviewResponse">>>; // We only generate link preview responses via the backend, so we can safely exclude it from the schema
