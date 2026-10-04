import { solveLinearSystem } from "#src/services/genshinParity/solveLinearSystem";

// The powers, none negative, minimising a quadratic's residual `p·Ap − 2 p·r`: every subset of the voices is solved
// Exactly with the rest held silent, and the feasible solution with the least residual kept, so a voice that only
// Worsens the mix is silenced rather than given a negative power. A handful of voices make a handful of subsets
export const solveVoicePowers = (gram: number[][], rhs: number[]): number[] => {
  let best = { powers: rhs.map(() => 0), residual: 0 };
  for (let subset = 1; subset < 2 ** rhs.length; subset++) {
    const voices = rhs.flatMap((_, voice) => ((subset >> voice) & 1 ? [voice] : []));
    const solved = solveLinearSystem(
      voices.map((row) => voices.map((column) => gram[row]?.[column] ?? 0)),
      voices.map((voice) => rhs[voice] ?? 0),
    );
    if (!solved?.every((power) => power >= 0)) continue;
    const powers = rhs.map(() => 0);
    for (const [index, voice] of voices.entries()) powers[voice] = solved[index] ?? 0;
    // At the exact solution of a subset its residual is the negated product of its powers with the right-hand side
    const residual = -powers.reduce((sum, power, voice) => sum + power * (rhs[voice] ?? 0), 0);
    if (residual < best.residual) best = { powers, residual };
  }
  return best.powers;
};
