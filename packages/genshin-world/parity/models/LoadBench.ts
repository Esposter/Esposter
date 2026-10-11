// What a screen's load cost by the moment it signals ready: its load steps' measures, the game data its requests fetched
// And every request's bytes, and the scene's renderer and objects, read as the scene bench reads them
export interface LoadBench {
  gameDataBytes: number;
  gameDataRequests: number;
  geometries: number;
  kindCounts: Record<string, number>;
  measures: { duration: number; isFailed: boolean; name: string }[];
  programs: number;
  requests: number;
  textures: number;
  totalBytes: number;
}
