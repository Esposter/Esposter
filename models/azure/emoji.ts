import { CompositeKeyEntity } from "@/models/azure";
import type { toZod } from "tozod";
import { JsonObject, JsonProperty } from "typescript-json-serializer";
import { z } from "zod";

export interface Emoji {
  // We'll need the metadata row key to identify what emoji in the metadata table we're talking about
  messageMetadataRowKey: string;
  emoji: string;
  userIds: string[];
}

@JsonObject()
export class EmojiMetadataTagEntity {
  @JsonProperty()
  rowKey!: string;
}

export const emojiMetadataTagSchema: toZod<EmojiMetadataTagEntity> = z.object({
  rowKey: z.string().uuid(),
});

@JsonObject()
export class MessageEmojiMetadataEntity extends CompositeKeyEntity {
  @JsonProperty()
  emojiTag!: string;

  @JsonProperty()
  userIds!: string[];
}

export const messageEmojiMetadataSchema: toZod<MessageEmojiMetadataEntity> = z.object({
  partitionKey: z.string().uuid(),
  rowKey: z.string(),
  emojiTag: z.string(),
  userIds: z.array(z.string()),
});
