import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";
import { MAX_RESOURCE_CONTENT_LENGTH } from "#shared/services/resource/constants";
import { aItemEntitySchema } from "#shared/models/entity/AItemEntity";

export interface SourceColumnIds {
  sourceColumnIds: string[];
}

export const sourceColumnIdsSchema = z.object({
  sourceColumnIds: createUniqueArraySchema(aItemEntitySchema.shape.id).max(MAX_RESOURCE_CONTENT_LENGTH),
}) satisfies z.ZodType<SourceColumnIds>;
