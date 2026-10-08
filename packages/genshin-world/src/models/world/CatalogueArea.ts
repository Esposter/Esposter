import type { CatalogueSubarea } from "#src/models/world/CatalogueSubarea";
import type { GroundPoint } from "genshin-engine";

import { catalogueSubareaSchema } from "#src/models/world/CatalogueSubarea";
import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { WorldLayer } from "#src/models/world/WorldLayer";
import { createUniqueArraySchema } from "@esposter/shared";
import { WeatherKind } from "genshin-engine";
import { z } from "zod";

// An area of a region as the game names it, the part of the map its Statue of The Seven lights: which map it is on,
// Its outline, empty until the reference board draws it, its subareas, the subregion it belongs to, "" for none, and
// The weathers it can have, as the game ties weather to an area, the first its own: the weather a visit finds it in
export interface CatalogueArea {
  id: string;
  layer: WorldLayer;
  name: string;
  outline: GroundPoint[];
  subareas: CatalogueSubarea[];
  subregion: string;
  weathers: WeatherKind[];
}

export const catalogueAreaSchema = z.object({
  id: z.string().min(1),
  layer: z.enum(WorldLayer) satisfies z.ZodType<WorldLayer>,
  name: z.string().min(1),
  // A closed polygon may revisit a point, so its points need not be unique
  outline: z.array(groundPointSchema),
  subareas: createUniqueArraySchema(catalogueSubareaSchema, "id"),
  subregion: z.string(),
  weathers: createUniqueArraySchema(z.enum(WeatherKind)).min(1),
}) satisfies z.ZodType<CatalogueArea>;
