import type { GridEngineErrorKind } from "grid-engine-headless";

// A layer that was never drawn, refused by name, since its tiles cannot be read into the collision grid
export interface MissingTilemapLayerError {
  kind: typeof GridEngineErrorKind.InvalidGrid;
  layer: string;
}
