// One octave band of a render and of the game's sound in decibels over the frames a score reads: ours as rendered, the
// Game's read no quieter than the band's floor, and that floor
export interface BandLevels {
  floor: number;
  game: number[];
  ours: number[];
}
