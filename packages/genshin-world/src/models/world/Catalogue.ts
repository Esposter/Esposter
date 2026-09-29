import type { CatalogueRegion } from "#src/models/world/CatalogueRegion";

import { catalogueRegionSchema } from "#src/models/world/CatalogueRegion";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// Every region, area and subarea the game ships, organised as the game organises its own map
export interface Catalogue {
  regions: CatalogueRegion[];
}

export const catalogueSchema = z.object({
  regions: createUniqueArraySchema(catalogueRegionSchema, "id"),
}) satisfies z.ZodType<Catalogue>;
