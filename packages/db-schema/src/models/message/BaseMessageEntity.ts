import type { FileEntity } from "#src/models/azure/table/FileEntity";
import type { LinkPreviewResponse } from "#src/models/message/linkPreview/LinkPreviewResponse";
import type { StandardMessageType } from "#src/models/message/MessageType";
import type { User } from "#src/schema/users";
import type { ItemEntityType, ToData } from "@esposter/shared";
import type { Except } from "type-fest";

import { AzureEntity, createAzureEntitySchema } from "#src/models/azure/table/AzureEntity";
import { fileEntitySchema } from "#src/models/azure/table/FileEntity";
import { MessageType, standardMessageTypeSchema } from "#src/models/message/MessageType";
import { selectRoomInMessageSchema } from "#src/schema/roomsInMessage";
import { selectUserSchema } from "#src/schema/users";
import { FILE_MAX_LENGTH } from "#src/services/azure/container/constants";
import { createUniqueArraySchema, sanitizeTextHtml } from "@esposter/shared";
import { z } from "zod";

export const MENTION_MAX_LENGTH = 100;
export const MESSAGE_MAX_LENGTH = 10000;
export const sanitizedMessageSchema = z.string().transform(sanitizeTextHtml).pipe(z.string().max(MESSAGE_MAX_LENGTH));

export class BaseMessageEntity<TType extends MessageType = StandardMessageType>
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
  mentions: User["id"][] = [];
  declare message: string;
  replyRowKey?: string;
  type = MessageType.Message as TType;
}

export const baseMessageEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({
      partitionKey: selectRoomInMessageSchema.shape.id,
      // `reverseTickedTimestamp`
      rowKey: z.string(),
    }),
  ).shape,
  files: createUniqueArraySchema(fileEntitySchema, "id").max(FILE_MAX_LENGTH).default([]),
  isEdited: z.literal(true).optional(),
  isForward: z.literal(true).optional(),
  isPinned: z.literal(true).optional(),
  mentions: createUniqueArraySchema(selectUserSchema.shape.id).max(MENTION_MAX_LENGTH).default([]),
  message: sanitizedMessageSchema.default(""),
  replyRowKey: z.string().optional(),
  type: standardMessageTypeSchema.default(MessageType.Message),
}) satisfies z.ZodType<ToData<Except<BaseMessageEntity, "linkPreviewResponse">>>;
