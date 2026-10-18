// The survivor list before any pass has culled: every instance in order, so a draw that runs no pass, as on WebGL, takes
// Each instance as it is. A pass overwrites the slots it keeps, and the draw covers only those
export const createSurvivorIndices = (count: number): Uint32Array =>
  Uint32Array.from({ length: count }, (_value, index) => index);
