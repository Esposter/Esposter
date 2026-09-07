import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface SourceColumnIds {
  sourceColumnIds: string[];
}

export const sourceColumnIdsSchema = z.object({
  sourceColumnIds: createUniqueArraySchema(z.string()),
}) satisfies z.ZodType<SourceColumnIds>;
