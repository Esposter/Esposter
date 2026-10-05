// One ring of grass around the camera: a square grid of cells, each growing one blade, and the distances the ring's
// Blades grow in from and fade out by. The near ring is dense and fine, the middle ring sparse and coarse, and past
// It the ground's own colour carries the field
export interface GrassRing {
  // Blades a side, so the ring draws this squared
  cellsPerSide: number;
  // Past this distance the ring's blades have shrunk away
  fadeEnd: number;
  fadeStart: number;
  // Within this distance the ring grows nothing, where a finer ring grows instead
  innerRadius: number;
  // How much taller and wider than the near ring's a blade is, so a sparser ring still reads as a field
  scale: number;
  // The distance between cells, in metres
  spacing: number;
}
