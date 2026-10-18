import { FLOAT_RESIDUE } from "#src/services/floatResidue";

// A clock's seconds left after a step. Running down a fixed step of a sixtieth of a second, three hundred times, leaves a
// Residue of float error a sliver above zero, which would keep a status running one step past its seconds, so a residue
// Under FLOAT_RESIDUE reads as run out. A real duration is never that short, a frame being a sixtieth of a second
export const runDownSeconds = (secondsRemaining: number, stepSeconds: number): number => {
  const remainingSeconds = secondsRemaining - stepSeconds;
  return remainingSeconds > 0 && remainingSeconds < FLOAT_RESIDUE ? 0 : remainingSeconds;
};
