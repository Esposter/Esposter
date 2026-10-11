// The figures a screen's `load` run is held to: the time to ready, which is checked only on the machine named, and the
// Requests, game data bytes, visible objects, geometries, textures and programs at ready
export interface LoadBudget {
  gameDataBytes: number;
  geometries: number;
  machine: string;
  objects: number;
  programs: number;
  readyMs: number;
  requests: number;
  textures: number;
}
