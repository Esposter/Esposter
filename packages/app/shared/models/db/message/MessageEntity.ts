import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";
import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { ToData } from "#shared/models/entity/ToData";

import { selectUserSchema } from "#shared/db/schema/users";
import { AzureEntity } from "#shared/models/azure/AzureEntity";
import { fileEntitySchema } from "#shared/models/azure/FileEntity";
import { itemMetadataSchema } from "#shared/models/entity/ItemMetadata";
import { MESSAGE_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { z } from "zod";

export class MessageEntity extends AzureEntity {
  files: FileEntity[] = [];
  message!: string;
  replyRowKey?: string;
  userId!: string;

  constructor(init?: Partial<MessageEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const messageEntitySchema = z
  .object({
    files: z.array(fileEntitySchema),
    message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
    // ${roomId}-${createdAt.format("yyyyMMdd")}
    partitionKey: z.string(),
    replyRowKey: z.string().optional(),
    // reverse-ticked timestamp
    rowKey: z.string(),
    userId: selectUserSchema.shape.id,
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<ToData<MessageEntity>>;
