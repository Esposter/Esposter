// The light the game's deferred pass casts on its stone at one hour, in scene colour: the sun's colour through its toon
// Ramp, one colour a knot evenly from the ramp's dark end to its lit end (`computeStoneRampCoordinate`), the sky's
// Light as second order spherical harmonics over the world normal, one colour a term (`computeStoneHarmonics`), and a
// Light fading with height, its colour at the scene's ground dimming by `STONE_HEIGHT_FALLOFF` a metre up, the rate a
// Metre up the whole light darkens at (`computeStoneDarkening`), with the haze's colours over the stone away from the
// Sun and toward it
export interface StoneLight {
  harmonics: (readonly number[])[];
  hazeColor: readonly number[];
  hazeScatterColor: readonly number[];
  heightDarkening: number;
  heightFade: readonly number[];
  ramp: (readonly number[])[];
}
