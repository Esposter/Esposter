import type { CliffFeature } from "#src/models/terrain/CliffFeature";
import type { PlateauFeature } from "#src/models/terrain/PlateauFeature";
import type { RidgeFeature } from "#src/models/terrain/RidgeFeature";

export type TerrainFeature = CliffFeature | PlateauFeature | RidgeFeature;
