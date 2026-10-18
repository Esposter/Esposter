import type { CatalogueArea } from "#src/models/world/CatalogueArea";

import { SHEER_COLD_AREA_IDS } from "#src/services/sheerCold/constants";

// Whether the area holds the subzero climate, the area findAreaAt names for the character's point, none where no area holds it
export const isSheerColdArea = (area: Pick<CatalogueArea, "id"> | undefined): boolean =>
  area !== undefined && SHEER_COLD_AREA_IDS.includes(area.id);
