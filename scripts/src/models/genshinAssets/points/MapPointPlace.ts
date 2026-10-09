// A point of the official map carried into the game's coordinates: its id under the kind's prefix, its kind and the ground
// Point it stands at, as the fit places it
export interface MapPointPlace<Kind extends string> {
  id: string;
  kind: Kind;
  position: { x: number; z: number };
}
