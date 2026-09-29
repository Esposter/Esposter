import type { CatalogueSubarea } from "@/models/genshin/world/CatalogueSubarea";
import type { GroundPoint } from "genshin-engine";

import { catalogueSubareaSchema } from "@/models/genshin/world/CatalogueSubarea";
import { groundPointSchema } from "@/models/genshin/world/groundPointSchema";
import { WorldLayer } from "@/models/genshin/world/WorldLayer";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// An area of a region as the game names it, the part of the map its Statue of The Seven lights: which map it is on,
// Its outline, empty until the reference board draws it, its subareas, and the subregion it belongs to, "" for none
export interface CatalogueArea {
  id: string;
  layer: WorldLayer;
  name: string;
  outline: GroundPoint[];
  subareas: CatalogueSubarea[];
  subregion: string;
}

export const catalogueAreaSchema = z.object({
  id: z.string().min(1),
  layer: z.enum(WorldLayer) satisfies z.ZodType<WorldLayer>,
  name: z.string().min(1),
  // A closed polygon may revisit a point, so its points need not be unique
  outline: z.array(groundPointSchema),
  subareas: createUniqueArraySchema(catalogueSubareaSchema, "id"),
  subregion: z.string(),
}) satisfies z.ZodType<CatalogueArea>;
