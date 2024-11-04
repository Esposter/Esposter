import type { CompositeKeyEntity } from "@/models/azure";
import type { FileEntity } from "@/models/esbabbler/message/file";

import { AzureEntity } from "@/models/azure";
import { fileSchema } from "@/models/esbabbler/message/file";
import { itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { selectUserSchema } from "@/server/db/schema/users";
import { MESSAGE_MAX_LENGTH } from "@/services/esbabbler/constants";
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
