// The shape of the game's sky, which its colours are drawn under: how sharply the colours toward the sun give way to
// Those away, how far up the bottom colour and the halo reach, how tight the sun's halo draws, and the moon's size
export interface SkyShape {
  frontBackBlend: number;
  haloHeight: number;
  horizonBand: number;
  moonSize: number;
  sunHaloSize: number;
}
