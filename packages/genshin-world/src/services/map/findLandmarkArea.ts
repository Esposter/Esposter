import type { Catalogue } from "#src/models/world/Catalogue";
import type { CatalogueArea } from "#src/models/world/CatalogueArea";
import type { Landmark } from "#src/models/world/Landmark";

// The area a landmark stands in, as the teleport panel names it: the catalogue's area its areaId names, and none where
// The catalogue has no such area
export const findLandmarkArea = (catalogue: Catalogue, { areaId }: Landmark): CatalogueArea | undefined =>
  catalogue.regions.flatMap(({ areas }) => areas).find(({ id }) => id === areaId);
