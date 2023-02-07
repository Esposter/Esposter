import { CompositeKeyEntity } from "@/models/azure";
import type { EmojiMetadataTagEntity } from "@/models/azure/emoji";
import { emojiMetadataTagSchema } from "@/models/azure/emoji";
import type { FileEntity } from "@/models/azure/file";
import { fileSchema } from "@/models/azure/file";
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
  @JsonProperty() emojiMetadataTags!: EmojiMetadataTagEntity[];
  @JsonProperty() createdAt!: Date;
}

export const messageSchema: toZod<MessageEntity> = z.object({
  partitionKey: z.string().uuid(),
  rowKey: z.string(),
  creatorId: z.string().cuid(),
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
  files: z.array(fileSchema),
  emojiMetadataTags: z.array(emojiMetadataTagSchema),
  createdAt: z.date(),
});

@JsonObject()
export class MessageMetadataTagEntity {
  @JsonProperty() rowKey!: string;
}

export const messageMetadataTagSchema: toZod<MessageMetadataTagEntity> = z.object({
  rowKey: z.string().uuid(),
});
