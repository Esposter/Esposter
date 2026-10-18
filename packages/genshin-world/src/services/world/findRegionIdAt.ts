import type { Catalogue } from "#src/models/world/Catalogue";

import { findAreaAt } from "#src/services/world/findAreaAt";

// The id of the region the point on the ground stands in: the region whose area holds it, none where no area does
export const findRegionIdAt = ({ regions }: Catalogue, x: number, z: number): string | undefined =>
  regions.find(({ areas }) => findAreaAt(areas, x, z) !== undefined)?.id;
