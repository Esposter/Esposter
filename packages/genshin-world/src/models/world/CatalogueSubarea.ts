import type { GroundPoint } from "genshin-engine";

import { AreaTerrainType } from "#src/models/world/AreaTerrainType";
import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// A place inside an area as the game names it: a town, a lake, a ruin. Its outlines are the game's own, one for each
// Level-two area of its name the game draws, which it splits some places into (Sumeru City's lower and upper town),
// None where it draws none, and its terrain the kind of ground the game files it under, a city's among them
export interface CatalogueSubarea {
  areaTerrainType: AreaTerrainType;
  id: string;
  name: string;
  outlines: GroundPoint[][];
}

export const catalogueSubareaSchema = z.object({
  areaTerrainType: z.enum(AreaTerrainType) satisfies z.ZodType<AreaTerrainType>,
  id: z.string().min(1),
  name: z.string().min(1),
  // A closed polygon may revisit a point, so its points need not be unique, and an outline has no key to be unique by
  outlines: z.array(z.array(groundPointSchema)),
}) satisfies z.ZodType<CatalogueSubarea>;
