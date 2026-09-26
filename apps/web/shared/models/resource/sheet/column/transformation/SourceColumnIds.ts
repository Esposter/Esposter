import { aItemEntitySchema } from "#shared/models/entity/AItemEntity";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface SourceColumnIds {
  sourceColumnIds: string[];
}

export const sourceColumnIdsSchema = z.object({
  sourceColumnIds: createUniqueArraySchema(aItemEntitySchema.shape.id).max(MAX_RESOURCE_CONTENT_SIZE),
}) satisfies z.ZodType<SourceColumnIds>;
