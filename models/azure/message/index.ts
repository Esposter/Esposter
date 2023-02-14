import { CompositeKeyEntity } from "@/models/azure";
import type { FileEntity } from "@/models/azure/message/file";
import { fileSchema } from "@/models/azure/message/file";
import { MESSAGE_MAX_LENGTH } from "@/utils/validation";
import type { toZod } from "tozod";
import { JsonObject, JsonProperty } from "typescript-json-serializer";
import { z } from "zod";

@JsonObject()
export class MessageEntity extends CompositeKeyEntity {
  @JsonProperty() creatorId!: string;
  @JsonProperty() message!: string;
  @JsonProperty() files!: FileEntity[];
  @JsonProperty() createdAt!: Date;
}

export const messageSchema: toZod<MessageEntity> = z.object({
  // ${roomId}-${createdAt.format("yyyyMMdd")}
  partitionKey: z.string(),
  // reverse tick timestamp
  rowKey: z.string(),
  creatorId: z.string().cuid(),
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
  files: z.array(fileSchema),
  createdAt: z.date(),
});
