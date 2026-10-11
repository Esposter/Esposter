// What a screen's load cost from a moment on, the page's start or a crossing's move, read once: its load steps'
// Measures with the tiles each rebuilt, the game data its requests fetched and every request's bytes, the time its long
// Frames held the main thread, and the scene's renderer and objects, read as the scene bench reads them
export interface LoadBench {
  gameDataBytes: number;
  gameDataRequests: number;
  geometries: number;
  kindCounts: Record<string, number>;
  longFrameMs: number;
  measures: { duration: number; isFailed: boolean; name: string; tileCount: number }[];
  programs: number;
  requests: number;
  textures: number;
  totalBytes: number;
}
