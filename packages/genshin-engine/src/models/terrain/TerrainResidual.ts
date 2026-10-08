// The fine ground the features leave, as simplex noise summed over octaves: the first octave's amplitude in metres and
// its scale in metres, each octave after half the amplitude and half the scale
export interface TerrainResidual {
  amplitude: number;
  octaves: number;
  scale: number;
  seed: number;
}
