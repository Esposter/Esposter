import { CompositeKeyEntity } from "@/models/azure";
import type { toZod } from "tozod";
import { JsonObject, JsonProperty } from "typescript-json-serializer";
import { z } from "zod";

@JsonObject()
export class MessageEmojiMetadataEntity extends CompositeKeyEntity {
  @JsonProperty()
  emojiTag!: string;

  @JsonProperty()
  userIds!: string[];
}

export const messageEmojiMetadataSchema: toZod<MessageEmojiMetadataEntity> = z.object({
  // room id
  partitionKey: z.string().uuid(),
  rowKey: z.string().uuid(),
  emojiTag: z.string(),
  userIds: z.array(z.string().uuid()),
});
