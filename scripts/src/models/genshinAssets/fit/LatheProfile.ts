// A mesh fitted as a lathe: its axis in its own ground plane (the game's x and z), its foot, and the sections stacked
// Up from there, each a frustum between two radii over a height, which the engine's lathe kit builds
export interface LatheProfile {
  axis: [number, number];
  foot: number;
  sections: { bottomRadius: number; height: number; topRadius: number }[];
}
