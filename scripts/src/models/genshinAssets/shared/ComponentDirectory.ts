// Where one component's exports go: its root, its assets, its blocks' layout dumps, its scripts' raw bytes, its music
// Its shaders and, for a part of the open world, its streamed placements and terrain
export interface ComponentDirectory {
  assets: string;
  behaviours: string;
  layout: string;
  music: string;
  root: string;
  shaders: string;
  world: string;
}
