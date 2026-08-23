import { createNameSchema } from "#src/models/shared/Name";
import { normalizeString } from "@esposter/shared";
import { z } from "zod";

export const MAX_TAGS_COUNT = 50;
export const MAX_TAG_NAME_LENGTH = 128;
export const MAX_TAG_VALUE_LENGTH = 256;
// Azure tag parity: flat name:value metadata. Names are non-empty; values may be empty
// ("environment: " is a meaningful Azure tag), so only the name goes through the min(1) name pipe.
export const resourceTagsSchema = z
  .record(
    createNameSchema(MAX_TAG_NAME_LENGTH),
    z.string().transform(normalizeString).pipe(z.string().max(MAX_TAG_VALUE_LENGTH)),
  )
  .refine((tags) => Object.keys(tags).length <= MAX_TAGS_COUNT, {
    message: `A resource can have at most ${MAX_TAGS_COUNT} tags`,
  });

export type ResourceTags = z.infer<typeof resourceTagsSchema>;
