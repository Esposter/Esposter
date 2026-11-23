// Where one component's exports go: its root, its assets, its blocks' layout dumps, its scripts' raw bytes, its
// Particle Systems' raw bytes, its music, its shaders and, for a part of the open world, its streamed placements and
// Terrain
export interface ComponentDirectory {
  assets: string;
  behaviours: string;
  layout: string;
  music: string;
  particles: string;
  root: string;
  shaders: string;
  world: string;
}
