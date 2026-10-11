// What a message to or from a terrain worker is: the ground its tiles are computed over, loaded once as the worker
// Starts, the regions' grounds laid over it as each arrives, one tile of it asked for, or a tile it could not build
export enum TerrainWorkerMessageKind {
  Failed = "failed",
  Load = "load",
  RegionGrounds = "regionGrounds",
  Tile = "tile",
}
