import type { TerrainFeatureKind } from "#src/models/terrain/TerrainFeatureKind";

// A plateau: a flat top at its height inside its radius, its edge blended down across its falloff past the radius. A
// Negative height is a basin, which is how a coastline's water is drawn
export interface PlateauFeature {
  falloff: number;
  height: number;
  kind: TerrainFeatureKind.Plateau;
  radius: number;
  x: number;
  z: number;
}
