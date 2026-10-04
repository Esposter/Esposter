import { solveLinearSystem } from "#src/services/genshinParity/shared/solveLinearSystem";

type Vector = readonly [number, number, number];
// The sun's colour and the ambient light's, per channel, that best light a set of pixels from a direction by least
// Squares, neither below zero: each pixel's linear colour is its albedo times the sun's colour times its lit share (its normal toward the
// Sun, none facing away) plus its albedo times the ambient's, which is linear in the two colours for one direction.
// Returns the colours and the root mean square residual
export const fitLight = (
  samples: readonly { albedo: Vector; color: Vector; normal: Vector }[],
  direction: Vector,
): { ambient: [number, number, number]; residual: number; sun: [number, number, number] } => {
  const sun: [number, number, number] = [0, 0, 0];
  const ambient: [number, number, number] = [0, 0, 0];
  let squared = 0;
  for (const channel of [0, 1, 2] as const) {
    let ss = 0;
    let sa = 0;
    let aa = 0;
    let sc = 0;
    let ac = 0;
    for (const { albedo, color, normal } of samples) {
      const lit = Math.max(0, normal[0] * direction[0] + normal[1] * direction[1] + normal[2] * direction[2]);
      const sunTerm = albedo[channel] * lit;
      const ambientTerm = albedo[channel];
      ss += sunTerm * sunTerm;
      sa += sunTerm * ambientTerm;
      aa += ambientTerm * ambientTerm;
      sc += sunTerm * color[channel];
      ac += ambientTerm * color[channel];
    }
    const [freeSun = 0, freeAmbient = 0] = solveLinearSystem(
      [
        [ss, sa],
        [sa, aa],
      ],
      [sc, ac],
    ) ?? [0, ac / Math.max(aa, Number.EPSILON)];
    // Light adds and never takes away, so a colour below zero is held at zero and the other refitted alone
    let sunValue = freeSun;
    let ambientValue = freeAmbient;
    if (freeSun < 0) {
      sunValue = 0;
      ambientValue = Math.max(ac / Math.max(aa, Number.EPSILON), 0);
    } else if (freeAmbient < 0) {
      sunValue = Math.max(sc / Math.max(ss, Number.EPSILON), 0);
      ambientValue = 0;
    }
    sun[channel] = sunValue;
    ambient[channel] = ambientValue;
    for (const { albedo, color, normal } of samples) {
      const lit = Math.max(0, normal[0] * direction[0] + normal[1] * direction[1] + normal[2] * direction[2]);
      squared += (albedo[channel] * (sunValue * lit + ambientValue) - color[channel]) ** 2;
    }
  }
  return { ambient, residual: Math.sqrt(squared / Math.max(samples.length * 3, 1)), sun };
};
