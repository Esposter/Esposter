// Where one component's exports go: its root, its assets, its blocks' layout dumps, its scripts' raw bytes, its music
// And its shaders
export interface ComponentDirectory {
  assets: string;
  behaviours: string;
  layout: string;
  music: string;
  root: string;
  shaders: string;
}
