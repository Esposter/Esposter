import { MAX_TAG_NAME_LENGTH, MAX_TAG_VALUE_LENGTH, MAX_TAGS_COUNT } from "#src/services/resource/constants";
import { createNameSchema } from "#src/services/shared/createNameSchema";
import { createNormalizedStringSchema, createRecordSchema } from "@esposter/shared";
import type { z } from "zod";

// Azure tag parity: flat name:value metadata. Names are non-empty; values may be empty
// ("environment: " is a meaningful Azure tag), so only the name goes through the min(1) name pipe.
export const resourceTagsSchema = createRecordSchema(
  createNameSchema(MAX_TAG_NAME_LENGTH),
  createNormalizedStringSchema(MAX_TAG_VALUE_LENGTH),
  MAX_TAGS_COUNT,
);

export type ResourceTags = z.infer<typeof resourceTagsSchema>;
