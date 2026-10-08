// A mesh fitted as a radial profile: its axis in its own ground plane (the game's x and z), its foot, and the sections
// Stacked up from there, each a shaft of one radius at every angle about the axis, which the engine's statue kit lofts
export interface RadialProfile {
  axis: [number, number];
  foot: number;
  sections: { height: number; radii: number[] }[];
}
