import type { CompositeKeyEntity } from "@/shared/models/azure/CompositeKeyEntity";
import type { FileEntity } from "@/shared/models/azure/file";

import { selectUserSchema } from "@/server/db/schema/users";
import { AzureEntity } from "@/shared/models/azure/AzureEntity";
import { fileSchema } from "@/shared/models/azure/file";
import { itemMetadataSchema } from "@/shared/models/itemMetadata";
import { MESSAGE_MAX_LENGTH } from "@/shared/services/esbabbler/constants";
import { z } from "zod";

export class MessageEntity extends AzureEntity {
  files!: FileEntity[];

  message!: string;

  userId!: string;

  constructor(init: CompositeKeyEntity & Partial<MessageEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const messageSchema = z
  .object({
    files: z.array(fileSchema),
    message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
    // ${roomId}-${createdAt.format("yyyyMMdd")}
    partitionKey: z.string(),
    // reverse-ticked timestamp
    rowKey: z.string(),
    userId: selectUserSchema.shape.id,
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<MessageEntity>;