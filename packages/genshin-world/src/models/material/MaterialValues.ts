import type { Vector4Tuple } from "three";

import { MAX_MATERIAL_PROPERTY_COUNT } from "#src/services/constants";
import { createRecordSchema, createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The values a game shader reads from a material, as an avatar's and a scene's exports both hold them: its colours and
// Floats by property name, and the keywords it compiles its variant with
export interface MaterialValues {
  colors: Record<string, Vector4Tuple>;
  floats: Record<string, number>;
  keywords: string[];
}

export const materialValuesSchema = z.object({
  colors: createRecordSchema(
    z.string().min(1),
    z.tuple([z.number(), z.number(), z.number(), z.number()]),
    MAX_MATERIAL_PROPERTY_COUNT,
  ),
  floats: createRecordSchema(z.string().min(1), z.number(), MAX_MATERIAL_PROPERTY_COUNT),
  keywords: createUniqueArraySchema(z.string().min(1)),
}) satisfies z.ZodType<MaterialValues>;
