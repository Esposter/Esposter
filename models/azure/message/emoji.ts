import { CompositeKeyEntity } from "@/models/azure";
import { MessageMetadataType } from "@/models/azure/message/metadata";
import type { toZod } from "tozod";
import { JsonObject, JsonProperty } from "typescript-json-serializer";
import { z } from "zod";

@JsonObject()
class MessageMetadataEntity extends CompositeKeyEntity {
  @JsonProperty()
  messageRowKey!: string;

  @JsonProperty()
  type!: MessageMetadataType;
}

// @NOTE: Add strict type, toZod<MessageMetadataEntity>
// once toZod supports native enums
export const messageMetadataSchema = z.object({
  // ${roomId}-${createdAt.format("yyyyMMdd")}
  partitionKey: z.string(),
  // reverse tick timestamp
  rowKey: z.string(),
  messageRowKey: z.string(),
  type: z.nativeEnum(MessageMetadataType),
});

@JsonObject()
export class MessageEmojiMetadataEntity extends MessageMetadataEntity {
  @JsonProperty()
  emojiTag!: string;

  @JsonProperty()
  userIds!: string[];
}

export const messageEmojiMetadataSchema: toZod<MessageEmojiMetadataEntity> = messageMetadataSchema.merge(
  z.object({
    emojiTag: z.string(),
    userIds: z.array(z.string().uuid()),
  })
);
