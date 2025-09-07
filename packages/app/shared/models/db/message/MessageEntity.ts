import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";
import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { LinkPreviewResponse } from "#shared/models/message/linkPreview/LinkPreviewResponse";
import type { Except } from "type-fest";

import { selectUserSchema } from "#shared/db/schema/users";
import { AzureEntity, createAzureEntitySchema } from "#shared/models/azure/AzureEntity";
import { fileEntitySchema } from "#shared/models/azure/FileEntity";
import { MAX_FILE_LIMIT } from "#shared/services/azure/container/constants";
import { MESSAGE_MAX_LENGTH } from "#shared/services/message/constants";
import { refineMessageSchema } from "#shared/services/message/refineMessageSchema";
import { getPropertyNames } from "#shared/util/getPropertyNames";
import { z } from "zod";

export class MessageEntity extends AzureEntity {
  files: FileEntity[] = [];
  isEdited?: true;
  isForward?: true;
  // Only used by the frontend for visual effects
  isLoading?: true;
  linkPreviewResponse: LinkPreviewResponse | null = null;
  message!: string;
  replyRowKey?: string;
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
        // ${roomId}-${createdAt.format("yyyyMMdd")}
        partitionKey: z.string(),
        // reverse-ticked timestamp
        rowKey: z.string(),
      }),
    ).shape,
    files: fileEntitySchema.array().max(MAX_FILE_LIMIT).default([]),
    isEdited: z.literal(true).optional(),
    isForward: z.literal(true).optional(),
    message: z.string().max(MESSAGE_MAX_LENGTH).default(""),
    replyRowKey: z.string().optional(),
    userId: selectUserSchema.shape.id,
  }),
  // We only generate link preview responses via the backend, so we can safely exclude it from the schema
) satisfies z.ZodType<ToData<Except<MessageEntity, "linkPreviewResponse">>>;
