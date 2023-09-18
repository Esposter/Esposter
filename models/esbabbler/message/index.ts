import { selectUserSchema } from "@/db/schema/users";
import type { CompositeKeyEntity } from "@/models/azure";
import { AzureEntity } from "@/models/azure";
import type { FileEntity } from "@/models/esbabbler/message/file";
import { fileSchema } from "@/models/esbabbler/message/file";
import { itemMetadataSchema } from "@/models/shared/ItemMetadata";
import { MESSAGE_MAX_LENGTH } from "@/services/esbabbler/constants";
import { z } from "zod";

export class MessageEntity extends AzureEntity {
  creatorId!: string;

  message!: string;

  files!: FileEntity[];

  constructor(init: Partial<MessageEntity> & CompositeKeyEntity) {
    super();
    Object.assign(this, init);
  }
}

export const messageSchema = itemMetadataSchema.merge(
  z.object({
    // ${roomId}-${createdAt.format("yyyyMMdd")}
    partitionKey: z.string(),
    // reverse-ticked timestamp
    rowKey: z.string(),
    creatorId: selectUserSchema.shape.id,
    message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
    files: z.array(fileSchema),
  }),
) satisfies z.ZodType<MessageEntity>;
