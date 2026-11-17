import type { SceneMaterial } from "genshin-engine";

import { MAX_MATERIAL_PROPERTY_COUNT } from "#src/services/constants";
import { createRecordSchema, createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export const sceneMaterialSchema = z.object({
  colors: createRecordSchema(
    z.string().min(1),
    z.tuple([z.number(), z.number(), z.number(), z.number()]),
    MAX_MATERIAL_PROPERTY_COUNT,
  ),
  floats: createRecordSchema(z.string().min(1), z.number(), MAX_MATERIAL_PROPERTY_COUNT),
  keywords: createUniqueArraySchema(z.string().min(1)),
  name: z.string().min(1),
  // Empty where the writer could not name the shader, and absent where the layout names none
  shader: z.string().optional(),
  textures: createRecordSchema(
    z.string().min(1),
    z.object({
      name: z.string().min(1),
      offset: z.tuple([z.number(), z.number()]),
      scale: z.tuple([z.number(), z.number()]),
    }),
    MAX_MATERIAL_PROPERTY_COUNT,
  ),
}) satisfies z.ZodType<SceneMaterial>;
