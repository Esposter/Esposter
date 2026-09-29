import type { FileEntity } from "#src/models/azure/table/FileEntity";
import type { LinkPreviewResponse } from "#src/models/message/linkPreview/LinkPreviewResponse";
import type { StandardMessageType } from "#src/models/message/StandardMessageType";
import type { UserInAuth } from "#src/schema/auth/usersInAuth";
import type { ItemEntityType, ToData } from "@esposter/shared";
import type { Except } from "type-fest";

import { AzureEntity, createAzureEntitySchema } from "#src/models/azure/table/AzureEntity";
import { fileEntitySchema } from "#src/models/azure/table/FileEntity";
import { reverseTickedTimestampSchema } from "#src/models/azure/table/ReverseTickedTimestamp";
import { MessageType } from "#src/models/message/MessageType";
import { sanitizedMessageSchema } from "#src/models/message/SanitizedMessage";
import { standardMessageTypeSchema } from "#src/models/message/StandardMessageType";
import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";
import { selectRoomInMessageSchema } from "#src/schema/message/roomsInMessage";
import { FILE_MAX_LENGTH } from "#src/services/azure/container/constants";
import { MENTION_MAX_LENGTH } from "#src/services/message/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

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
  mentions: UserInAuth["id"][] = [];
  declare message: string;
  replyRowKey?: string;
  type = MessageType.Message as TType;
}

export const baseMessageEntitySchema = z.object({
  ...createAzureEntitySchema(
    z.object({ partitionKey: selectRoomInMessageSchema.shape.id, rowKey: reverseTickedTimestampSchema }),
  ).shape,
  files: createUniqueArraySchema(fileEntitySchema, "id").max(FILE_MAX_LENGTH).default([]),
  isEdited: z.literal(true).optional(),
  isForward: z.literal(true).optional(),
  isPinned: z.literal(true).optional(),
  mentions: createUniqueArraySchema(selectUserInAuthSchema.shape.id).max(MENTION_MAX_LENGTH).default([]),
  message: sanitizedMessageSchema.default(""),
  replyRowKey: reverseTickedTimestampSchema.or(z.literal("")).optional(),
  type: standardMessageTypeSchema.default(MessageType.Message),
}) satisfies z.ZodType<ToData<Except<BaseMessageEntity, "linkPreviewResponse">>>;
