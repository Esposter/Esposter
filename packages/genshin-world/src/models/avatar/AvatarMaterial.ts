import type { Vector4Tuple } from "three";

import { MAX_MATERIAL_PROPERTY_COUNT } from "#src/services/constants";
import { createRecordSchema, createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A material's values as the game's shader reads them: its colours and floats by property name, the keywords it compiles
// Its variant with, and each texture slot's file, relative to the component's assets folder
export interface AvatarMaterial {
  colors: Record<string, Vector4Tuple>;
  floats: Record<string, number>;
  keywords: string[];
  textures: Record<string, string>;
}

export const avatarMaterialSchema = z.object({
  colors: createRecordSchema(
    z.string().min(1),
    z.tuple([z.number(), z.number(), z.number(), z.number()]),
    MAX_MATERIAL_PROPERTY_COUNT,
  ),
  floats: createRecordSchema(z.string().min(1), z.number(), MAX_MATERIAL_PROPERTY_COUNT),
  keywords: createUniqueArraySchema(z.string().min(1)),
  textures: createRecordSchema(z.string().min(1), z.string().min(1), MAX_MATERIAL_PROPERTY_COUNT),
}) satisfies z.ZodType<AvatarMaterial>;
