import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";
import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { ToData } from "#shared/models/entity/ToData";

import { selectUserSchema } from "#shared/db/schema/users";
import { AzureEntity, createAzureEntitySchema } from "#shared/models/azure/AzureEntity";
import { fileEntitySchema } from "#shared/models/azure/FileEntity";
import { MESSAGE_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { z } from "zod";

export class MessageEntity extends AzureEntity {
  files: FileEntity[] = [];
  isForward?: true;
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
).merge(
  z.object({
    files: z.array(fileEntitySchema),
    isForward: z.literal(true),
    message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
    replyRowKey: z.string().optional(),
    userId: selectUserSchema.shape.id,
  }),
) satisfies z.ZodType<ToData<MessageEntity>>;
