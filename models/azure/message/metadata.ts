import type { toZod } from "tozod";
import { JsonObject, JsonProperty } from "typescript-json-serializer";
import { z } from "zod";

@JsonObject()
export class MessageMetadataTagEntity {
  @JsonProperty() rowKey!: string;
}

export const messageMetadataTagSchema: toZod<MessageMetadataTagEntity> = z.object({
  rowKey: z.string().uuid(),
});

@JsonObject()
export class MessageEmojiMetadataTagEntity extends MessageMetadataTagEntity {}

export const emojiMetadataTagSchema: toZod<MessageEmojiMetadataTagEntity> = z.object({
  rowKey: z.string().uuid(),
});
