import type { Catalogue } from "#src/models/world/Catalogue";
import type { CatalogueArea } from "#src/models/world/CatalogueArea";

import { computeOutlineDistance } from "genshin-engine";

// The area a point stands in: the first whose drawn outline holds it, and none where no outline does. An area with no
// Outline drawn yet is never found, since nothing places a point inside it
export const findAreaAt = (catalogue: Catalogue, x: number, z: number): CatalogueArea | undefined =>
  catalogue.regions
    .flatMap(({ areas }) => areas)
    .find(({ outline }) => outline.length > 0 && computeOutlineDistance(outline, x, z) === 0);
