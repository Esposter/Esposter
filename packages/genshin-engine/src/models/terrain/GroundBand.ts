// Where a ground layer fades in by a measure of the ground, its height or its slope: none at the start and all of it at
// The end, smoothly between, or the other way about where the end stands below the start
export interface GroundBand {
  end: number;
  start: number;
}
