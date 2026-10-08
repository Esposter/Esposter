// One square of ground scattered with plants that no record places: its side in metres, the least distance between
// Two plants, how many candidate points are thrown at it, and the ground's verdict on each candidate
export interface ScatterOptions {
  candidateCount: number;
  // Whether a plant grows at a point, given as its distance in metres from the square's corner
  checkIsAccepted: (x: number, z: number) => boolean;
  // Seeds the candidates, so the same square always grows the same plants
  seed: number;
  size: number;
  spacing: number;
}
