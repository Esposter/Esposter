import type { GridGeometry } from "#src/models/GridGeometry";

// The box a drag draws where its item would land, marked when the grid would refuse the landing
export interface GridPlaceholder {
  geometry: GridGeometry;
  isRefused: boolean;
}
