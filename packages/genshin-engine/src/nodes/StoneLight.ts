// The light the game's deferred pass casts on its stone at one hour, in scene colour: the sun's colour through its toon
// Ramp, one colour a knot evenly from the ramp's dark end to its lit end (`computeStoneRampCoordinate`), and the sky's
// Light as second order spherical harmonics over the world normal, one colour a term (`computeStoneHarmonics`)
export interface StoneLight {
  harmonics: (readonly number[])[];
  ramp: (readonly number[])[];
}
