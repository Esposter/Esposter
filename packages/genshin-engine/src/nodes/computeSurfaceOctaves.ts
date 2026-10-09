import type { SurfaceDetail } from "#src/models/nodes/SurfaceDetail";

import { SURFACE_OCTAVE_RESPONSES, SURFACE_OCTAVE_TEXEL_FREQUENCIES } from "#src/nodes/constants";

interface SurfaceOctave {
  amplitude: number;
  frequency: number;
}

// The iterations a fit's amplitudes are solved over, each multiplying every amplitude by how far the model is from its target
const SOLVE_ITERATIONS = 300;
// Where the amplitudes start, a little above zero, since a multiplicative update cannot leave zero
const SOLVE_START_ENERGY = 1e-6;
// Each octave's response in every band of the detail and in its variance, the measured rows of `SURFACE_OCTAVE_RESPONSES`,
// Relative to the target a row holds, so a band of little energy weighs as much as the variance
const computeResponses = (targets: number[]): number[][] =>
  SURFACE_OCTAVE_RESPONSES.map((responses) =>
    responses.map((response, row) => (targets[row] ? response / targets[row] : 0)),
  );
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
// Best, each octave's frequency the world's, its texels spanning the metres its texture's do where it is drawn
export const computeSurfaceOctaves = ({ bands, metresPerTexel, variance }: SurfaceDetail): SurfaceOctave[] => {
  const targets = [...bands, variance];
  const energies = solveOctaveEnergies(computeResponses(targets), targets);
  return SURFACE_OCTAVE_TEXEL_FREQUENCIES.map((texelFrequency, octave) => ({
    amplitude: Math.sqrt(energies[octave] ?? 0),
    frequency: texelFrequency / metresPerTexel,
  }));
};
