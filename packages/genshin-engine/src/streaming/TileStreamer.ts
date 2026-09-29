import type { TerrainSelection } from "#src/terrain/TerrainSelection";

export interface TileStreamer<TTile> {
  // Frees every tile held, and ignores any that arrive after
  dispose: () => void;
  get: (key: number) => TTile | undefined;
  has: (key: number) => boolean;
  // Takes a tile the worker has finished, unless it is no longer wanted and the cache is full
  receive: (key: number, tile: TTile) => void;
  // Marks this frame's wanted tiles as used, and asks for the missing ones, coarsest first
  update: (wanted: TerrainSelection) => void;
}
