// One piece of the login's walkway as its fit writes it: its outline seen from above, the height its stone stands at,
// And what stands raised over that stone, each loop at its own height
export interface LoginWalkwayPiece {
  outline: [number, number][];
  raised: { outline: [number, number][]; top: number }[];
  top: number;
}
