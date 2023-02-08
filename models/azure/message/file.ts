import type { toZod } from "tozod";
import { JsonObject, JsonProperty } from "typescript-json-serializer";
import { z } from "zod";

@JsonObject()
export class FileEntity {
  @JsonProperty()
  url!: string;

  @JsonProperty()
  mimetype!: string;
}

export const fileSchema: toZod<FileEntity> = z.object({
  url: z.string(),
  mimetype: z.string(),
});
