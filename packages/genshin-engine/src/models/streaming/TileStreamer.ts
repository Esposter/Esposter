import type { TerrainSelection } from "#src/models/terrain/TerrainSelection";

export interface TileStreamer<TTile> {
  // Frees every tile held, and ignores any that arrive after
  dispose: () => void;
  get: (key: number) => TTile | undefined;
  has: (key: number) => boolean;
  // Takes a tile the worker has finished, freed first once the cache is full if it is no longer wanted
  receive: (key: number, tile: TTile) => void;
  // Marks this frame's wanted, drawn and surrounding tiles as used, and asks for the missing wanted ones, coarsest
  // First, then the missing surrounding ones. The drawn are the wanted resolved against what is held, so the ancestors
  // Standing in for missing tiles stay held; the surrounding are the tiles round the eye the view does not show, held
  // So a turn of the camera finds its ground already there rather than a hole while it generates
  update: (wanted: TerrainSelection, drawn: TerrainSelection, surrounding: TerrainSelection) => void;
}
