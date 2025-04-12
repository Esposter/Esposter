import type { CompositeKeyEntity } from "#shared/models/azure/CompositeKeyEntity";
import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { Type } from "arktype";

import { selectUserSchema } from "#shared/db/schema/users";
import { AzureEntity, createAzureEntitySchema } from "#shared/models/azure/AzureEntity";
import { fileEntitySchema } from "#shared/models/azure/FileEntity";
import { MESSAGE_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { type } from "arktype";

export class MessageEntity extends AzureEntity {
  files: FileEntity[] = [];
  message!: string;
  replyToMessageRowKey?: string;
  userId!: string;

  constructor(init?: Partial<MessageEntity> & ToData<CompositeKeyEntity>) {
    super();
    Object.assign(this, init);
  }
}

export const messageEntitySchema = createAzureEntitySchema(
  type({
    files: fileEntitySchema.array(),
    message: `0 < string <= ${MESSAGE_MAX_LENGTH}`,
    // ${roomId}-${createdAt.format("yyyyMMdd")}
    partitionKey: "string",
    // reverse-ticked timestamp
    rowKey: "string",
    userId: selectUserSchema.get("id"),
  }),
) satisfies Type<ToData<MessageEntity>>;
