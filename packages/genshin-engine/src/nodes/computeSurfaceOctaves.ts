import type { SurfaceDetail } from "#src/models/nodes/SurfaceDetail";

import { SURFACE_DETAIL_BAND_SIGMAS, SURFACE_DETAIL_METRES_PER_TEXEL } from "#src/nodes/constants";

export interface SurfaceOctave {
  amplitude: number;
  frequency: number;
}

// The iterations a fit's amplitudes are solved over, each multiplying every amplitude by how far the model is from its target
const SOLVE_ITERATIONS = 300;
// Where the amplitudes start, a little above zero, since a multiplicative update cannot leave zero
const SOLVE_START_ENERGY = 1e-6;
// The blur edges each band lies between, from the texel itself (sigma zero) up to the coarsest sigma
const BAND_EDGE_SIGMAS = [0, ...SURFACE_DETAIL_BAND_SIGMAS];
// The octaves a fit's detail is built from: one at each band's peak, which is a cycle per 2 pi sigma texels at its
// Coarse edge, then one at half the coarsest band's, which holds the variance the bands leave
const COARSEST_SIGMA = BAND_EDGE_SIGMAS.at(-1) ?? 0;
const OCTAVE_TEXEL_FREQUENCIES = [
  ...BAND_EDGE_SIGMAS.slice(1).map((sigma) => 1 / (2 * Math.PI * sigma)),
  1 / (4 * Math.PI * COARSEST_SIGMA),
];
// The energy a unit-variance sinusoid at a texel frequency leaves in the difference of two blurs, which is the band's
// Share of it. The variance a sinusoid holds is half its amplitude squared, so its target row is a half
const computeBandResponse = (fineSigma: number, coarseSigma: number, texelFrequency: number): number => {
  const decay = 2 * Math.PI ** 2 * texelFrequency ** 2;
  return (Math.exp(-decay * fineSigma ** 2) - Math.exp(-decay * coarseSigma ** 2)) ** 2 / 2;
};
// Each octave's response in every band of the detail and in its variance, the rows the bands and the variance are,
// Relative to the target a row holds, so a band of little energy weighs as much as the variance
const computeResponses = (targets: number[]): number[][] =>
  OCTAVE_TEXEL_FREQUENCIES.map((texelFrequency) => [
    ...BAND_EDGE_SIGMAS.slice(0, -1).map((fineSigma, band) =>
      computeBandResponse(fineSigma, BAND_EDGE_SIGMAS[band + 1] ?? 0, texelFrequency),
    ),
    0.5,
  ]).map((responses) => responses.map((response, row) => (targets[row] ? response / targets[row] : 0)));
// The non-negative energies of the octaves whose responses sum to the targets, by multiplicative updates on the
// Squared error (Lee and Seung), each octave's energy scaled by how far its responses fall short of the targets
const solveOctaveEnergies = (responses: number[][], targets: number[]): number[] => {
  const energies = responses.map(() => SOLVE_START_ENERGY);
  for (let iteration = 0; iteration < SOLVE_ITERATIONS; iteration++) {
    const modelled = targets.map((_target, row) =>
      energies.reduce((sum, energy, octave) => sum + energy * (responses[octave]?.[row] ?? 0), 0),
    );
    for (const [octave, octaveResponses] of responses.entries()) {
      const demand = targets.reduce((sum, target, row) => sum + (octaveResponses[row] ?? 0) * (target > 0 ? 1 : 0), 0);
      const supply = modelled.reduce((sum, value, row) => sum + (octaveResponses[row] ?? 0) * value, 0);
      energies[octave] = demand === 0 ? 0 : (energies[octave] ?? 0) * (supply > 0 ? demand / supply : 1);
    }
  }
  return energies;
};
// A surface's detail as noise octaves in the world: the amplitudes whose octaves' bands reproduce the detail's energies
// Best, each octave's frequency the world's, its texels spanning `SURFACE_DETAIL_METRES_PER_TEXEL`
export const computeSurfaceOctaves = ({ bands, variance }: SurfaceDetail): SurfaceOctave[] => {
  const targets = [...bands, variance];
  const energies = solveOctaveEnergies(computeResponses(targets), targets);
  return OCTAVE_TEXEL_FREQUENCIES.map((texelFrequency, octave) => ({
    amplitude: Math.sqrt(energies[octave] ?? 0),
    frequency: texelFrequency / SURFACE_DETAIL_METRES_PER_TEXEL,
  }));
};
