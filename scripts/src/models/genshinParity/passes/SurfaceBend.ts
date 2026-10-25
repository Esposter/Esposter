// How far each family's normals bend off their geometry's, per side, over the pixels both sides draw: the mean bend of
// Each side, and the exports' bend over each half of the family's blocks of `SPLIT_BLOCK_PIXELS` as a chequerboard. The
// Two halves read against each other are the floor a bend matched in distribution is gated at
export interface SurfaceBend {
  exportsAngle: number;
  family: number;
  halves: [number, number];
  oursAngle: number;
}
