import type { TerrainResidualFade } from "#src/models/terrain/TerrainResidualFade";

// The fine ground the features leave, as simplex noise summed over octaves: the first octave's amplitude in metres and
// Its scale in metres, each octave after half the amplitude and half the scale, faded by place where a fade is given
// And whole everywhere without one
export interface TerrainResidual {
  amplitude: number;
  fade?: TerrainResidualFade;
  octaves: number;
  scale: number;
  seed: number;
}
