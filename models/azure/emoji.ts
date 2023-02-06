import type { toZod } from "tozod";
import { JsonObject, JsonProperty } from "typescript-json-serializer";
import { z } from "zod";

@JsonObject()
export class EmojiMetadataTagEntity {
  @JsonProperty()
  rowKey!: string;

  @JsonProperty()
  emojiTag!: string;

  // Only used for sorting emoji metadata tag list in order from highest count to lowest
  @JsonProperty()
  count!: number;
}

export const emojiMetadataTagSchema: toZod<EmojiMetadataTagEntity> = z.object({
  rowKey: z.string(),
  emojiTag: z.string(),
  count: z.number().int(),
});
