import type { LinkPreviewResponse } from "#src/models/message/linkPreview/LinkPreviewResponse";
import type { ReverseTickedTimestamp } from "#src/models/message/ReverseTickedTimestamp";
import type { StandardMessageType } from "#src/models/message/StandardMessageType";
import type { FileEntity } from "#src/models/streams/FileEntity";
import type { UserInAuth } from "#src/schema/auth/usersInAuth";
import type { ItemEntityType, ToData } from "@esposter/shared";
import type { Except } from "type-fest";

import { MessageType } from "#src/models/message/MessageType";
import { reverseTickedTimestampSchema } from "#src/models/message/ReverseTickedTimestamp";
import { sanitizedMessageSchema } from "#src/models/message/SanitizedMessage";
import { standardMessageTypeSchema } from "#src/models/message/StandardMessageType";
import { AzureEntity } from "#src/models/shared/AzureEntity";
import { itemMetadataSchema } from "#src/models/shared/ItemMetadata";
import { fileEntitySchema } from "#src/models/streams/FileEntity";
import { selectUserInAuthSchema } from "#src/schema/auth/usersInAuth";
import { selectRoomInMessageSchema } from "#src/schema/message/roomsInMessage";
import { MENTION_MAX_LENGTH } from "#src/services/message/constants";
import { FILE_MAX_LENGTH } from "#src/services/storage/constants";
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
  message = "";
  replyRowKey: "" | ReverseTickedTimestamp = "";
  declare rowKey: ReverseTickedTimestamp;
  type = MessageType.Message as TType;
}

export const baseMessageEntitySchema = z.object({
  partitionKey: selectRoomInMessageSchema.shape.id,
  rowKey: reverseTickedTimestampSchema,
  ...itemMetadataSchema.shape,
  files: createUniqueArraySchema(fileEntitySchema, "id").max(FILE_MAX_LENGTH),
  isEdited: z.literal(true).optional(),
  isForward: z.literal(true).optional(),
  isPinned: z.literal(true).optional(),
  mentions: createUniqueArraySchema(selectUserInAuthSchema.shape.id).max(MENTION_MAX_LENGTH),
  message: sanitizedMessageSchema,
  replyRowKey: reverseTickedTimestampSchema.or(z.literal("")),
  type: standardMessageTypeSchema,
}) satisfies z.ZodType<ToData<Except<BaseMessageEntity, "linkPreviewResponse">>>;
