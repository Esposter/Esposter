// The residue float error leaves beside the value a sum of steps should reach: three hundred steps of a sixtieth of a second
// Fall a sliver short of the seconds they make up, and steps of points fall a sliver short of their count. A residue under
// A billionth reads as reached, which no real duration or count is this close to
export const FLOAT_RESIDUE = 1e-9;
