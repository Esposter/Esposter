import type { MaterialValues } from "#src/models/material/MaterialValues";

import { materialValuesSchema } from "#src/models/material/MaterialValues";
import { MAX_MATERIAL_PROPERTY_COUNT } from "#src/services/constants";
import { createRecordSchema } from "@esposter/shared";
import { z } from "zod";

// A material's values as the game's shader reads them, and each texture slot's file, relative to the component's assets
// Folder
export interface AvatarMaterial extends MaterialValues {
  textures: Record<string, string>;
}

export const avatarMaterialSchema = z.object({
  ...materialValuesSchema.shape,
  textures: createRecordSchema(z.string().min(1), z.string().min(1), MAX_MATERIAL_PROPERTY_COUNT),
}) satisfies z.ZodType<AvatarMaterial>;
