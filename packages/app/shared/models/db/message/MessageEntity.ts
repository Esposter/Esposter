import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";
import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { SetOptional } from "type-fest";

import { selectUserSchema } from "#shared/db/schema/users";
import { AzureEntity, createAzureEntitySchema } from "#shared/models/azure/AzureEntity";
import { fileEntitySchema } from "#shared/models/azure/FileEntity";
import { MAX_FILE_LIMIT } from "#shared/services/azure/container/constants";
import { MESSAGE_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { z } from "zod";

export class MessageEntity extends AzureEntity {
  files: FileEntity[] = [];
  isEdited?: true;
  isForward?: true;
  // Only used by the frontend for visual effects
  isLoading?: true;
  message!: string;
  replyRowKey?: string;
  userId!: string;

  constructor(init?: Partial<MessageEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const messageEntitySchema = createAzureEntitySchema(
  z.object({
    // ${roomId}-${createdAt.format("yyyyMMdd")}
    partitionKey: z.string(),
    // reverse-ticked timestamp
    rowKey: z.string(),
  }),
).extend(
  // @TODO: oneOf([files, message])
  z.object({
    files: fileEntitySchema.array().max(MAX_FILE_LIMIT).default([]),
    isEdited: z.literal(true).optional(),
    isForward: z.literal(true).optional(),
    message: z.string().max(MESSAGE_MAX_LENGTH).default(""),
    replyRowKey: z.string().optional(),
    userId: selectUserSchema.shape.id,
  }),
) satisfies z.ZodType<ToData<SetOptional<MessageEntity, "files" | "message">>>;
