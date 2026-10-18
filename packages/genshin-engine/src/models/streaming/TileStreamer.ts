import type { TerrainSelection } from "#src/models/terrain/TerrainSelection";

export interface TileStreamer<TTile> {
  // Frees every tile held, and ignores any that arrive after
  dispose: () => void;
  // Releases a tile the worker could not build, freeing its slot so a later frame that wants it asks again. Returns
  // Whether this failure gave the tile up for the session, after MAX_TILE_ATTEMPTS of them
  fail: (key: number) => boolean;
  get: (key: number) => TTile | undefined;
  has: (key: number) => boolean;
  // Whether a tile is held or given up, so the view has nothing more to wait on for it
  isSettled: (key: number) => boolean;
  // Takes a tile the worker has finished, freed first once the cache is full if it is no longer wanted, in place of
  // The one held under its key, which is freed unless it is the same tile
  receive: (key: number, tile: TTile) => void;
  // Asks again for every tile held or generating that the ground changed under, as `checkIsChanged` names them by key:
  // Each held one stays drawn until its replacement arrives, and none is settled until then
  refresh: (checkIsChanged: (key: number) => boolean) => void;
  // Marks this frame's wanted, drawn and surrounding tiles as used, and asks for the missing wanted ones, coarsest
  // First, then the missing surrounding ones. The drawn are the wanted resolved against what is held, so the ancestors
  // Standing in for missing tiles stay held; the surrounding are the tiles round the eye the view does not show, held
  // So a turn of the camera finds its ground already there rather than a hole while it generates
  update: (wanted: TerrainSelection, drawn: TerrainSelection, surrounding: TerrainSelection) => void;
}
