import type { CompositeKeyEntity } from "@/models/azure";
import type { FileEntity } from "@/models/esbabbler/message/file";

import { selectUserSchema } from "@/db/schema/users";
import { AzureEntity } from "@/models/azure";
import { fileSchema } from "@/models/esbabbler/message/file";
import { itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { MESSAGE_MAX_LENGTH } from "@/services/esbabbler/constants";
import { z } from "zod";

export class MessageEntity extends AzureEntity {
  userId!: string;

  files!: FileEntity[];

  message!: string;

  constructor(init: CompositeKeyEntity & Partial<MessageEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const messageSchema = z
  .object({
    userId: selectUserSchema.shape.id,
    files: z.array(fileSchema),
    message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
    // ${roomId}-${createdAt.format("yyyyMMdd")}
    partitionKey: z.string(),
    // reverse-ticked timestamp
    rowKey: z.string(),
  })
  .merge(itemMetadataSchema) satisfies z.ZodType<MessageEntity>;
