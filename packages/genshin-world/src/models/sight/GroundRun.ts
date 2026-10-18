// The ground run from a sight's origin to its end: the distance between them and the unit direction from the origin toward
// The end, which is zero both ways where the end is where the origin stands
export interface GroundRun {
  directionX: number;
  directionZ: number;
  distance: number;
}
