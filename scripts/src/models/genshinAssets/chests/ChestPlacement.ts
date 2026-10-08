import type { ChestPlace } from "genshin-world";

// Where every chest the official map marks was placed: each region's places by its region id, and how many chests the
// Map marks on the layers under the ground or in no mapped region, which are left out for now
export interface ChestPlacement {
  places: Record<string, ChestPlace[]>;
  skippedUnderground: number;
  skippedUnmapped: number;
}
