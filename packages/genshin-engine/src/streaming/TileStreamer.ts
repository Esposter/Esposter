import type { TerrainSelection } from "#src/terrain/TerrainSelection";

export interface TileStreamer<TTile> {
  // Frees every tile held, and ignores any that arrive after
  dispose: () => void;
  get: (key: number) => TTile | undefined;
  has: (key: number) => boolean;
  // Takes a tile the worker has finished, freed first once the cache is full if it is no longer wanted
  receive: (key: number, tile: TTile) => void;
  // Marks this frame's wanted and drawn tiles as used, and asks for the missing wanted ones, coarsest first. The
  // Drawn are the wanted resolved against what is held, so the ancestors standing in for missing tiles stay held
  update: (wanted: TerrainSelection, drawn: TerrainSelection) => void;
}
