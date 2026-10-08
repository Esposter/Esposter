import type { InazumaBuildingRoof } from "#src/models/inazuma/InazumaBuildingRoof";

// A building's proportions in metres: its ground footprint, its raised timber floor, and its storeys, each storey's
// Walls and the roof on them. An upper storey is inset from the one below on every side by the setback
export interface InazumaBuildingOptions {
  depth: number;
  eaveOverhang: number;
  floorHeight: number;
  roof: InazumaBuildingRoof;
  roofHeight: number;
  storeyCount: number;
  storeyHeight: number;
  storeySetback: number;
  width: number;
}
