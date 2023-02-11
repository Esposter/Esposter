import { CompositeKeyEntity } from "@/models/azure";
import type { FileEntity } from "@/models/azure/message/file";
import { fileSchema } from "@/models/azure/message/file";
import type { MessageEmojiMetadataTagEntity } from "@/models/azure/message/metadata";
import { emojiMetadataTagSchema } from "@/models/azure/message/metadata";
import { MESSAGE_MAX_LENGTH } from "@/utils/validation";
import type { toZod } from "tozod";
import { JsonObject, JsonProperty } from "typescript-json-serializer";
import { z } from "zod";

@JsonObject()
export class MessageEntity extends CompositeKeyEntity {
  @JsonProperty() creatorId!: string;
  @JsonProperty() message!: string;
  @JsonProperty() files!: FileEntity[];
  // We'll assume that this is already sorted in order from highest count to lowest
  @JsonProperty() emojiMetadataTags!: MessageEmojiMetadataTagEntity[];
  @JsonProperty() createdAt!: Date;
}

export const messageSchema: toZod<MessageEntity> = z.object({
  // room id
  partitionKey: z.string().uuid(),
  // reverse tick timestamp
  rowKey: z.string(),
  creatorId: z.string().cuid(),
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
  files: z.array(fileSchema),
  emojiMetadataTags: z.array(emojiMetadataTagSchema),
  createdAt: z.date(),
});
