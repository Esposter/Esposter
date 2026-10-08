import type { RoofKind } from "#src/models/kits/architecture/RoofKind";

// A building as a rectangular platform, four walls standing on it and a roof over them, all in metres from the ground
export interface BuildingOptions {
  depth: number;
  platformHeight: number;
  roofHeight: number;
  roofKind: RoofKind;
  wallHeight: number;
  wallThickness: number;
  width: number;
}
