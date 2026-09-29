import type { CatalogueArea } from "#src/models/world/CatalogueArea";

import { catalogueAreaSchema } from "#src/models/world/CatalogueArea";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A nation or borderland as the game names it, and its areas. Its id names its data file, `/genshin/<id>.json`
export interface CatalogueRegion {
  areas: CatalogueArea[];
  id: string;
  name: string;
}

export const catalogueRegionSchema = z.object({
  areas: createUniqueArraySchema(catalogueAreaSchema, "id"),
  id: z.string().min(1),
  name: z.string().min(1),
}) satisfies z.ZodType<CatalogueRegion>;
