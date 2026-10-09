// What a message to a terrain worker asks for: the ground its tiles are computed over, loaded once as the worker
// Starts, or one tile of it
export enum TerrainWorkerMessageKind {
  Load = "load",
  Tile = "tile",
}
