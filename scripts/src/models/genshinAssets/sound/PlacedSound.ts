// A candidate sound as a fit places it: its id, its band powers frame by frame, and the frame it starts at
export interface PlacedSound {
  id: number;
  powers: number[][];
  startFrame: number;
}
