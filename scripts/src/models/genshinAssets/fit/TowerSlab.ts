// A slab of a tower's wall: what stands out from it, a rib, a pilaster or a balcony, or what sinks into it, a window or a
// Bay, each built as geometry of its own over the lathe: the wall's radius at it, how far it stands out or sinks in, and
// The span it covers round the tower and up it, in the facade's frame
export interface TowerSlab {
  depth: number;
  radius: number;
  round: [number, number];
  up: [number, number];
}
