// A slab of a login tower's wall as its fit writes it: the wall's radius at it, how far it stands out or sinks in, and
// The span it covers round the tower and up it, in the units of the tower's mesh, round in its facade's frame
export interface TowerSlab {
  depth: number;
  radius: number;
  round: number[];
  up: number[];
}
