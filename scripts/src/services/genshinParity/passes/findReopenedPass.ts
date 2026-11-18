import type { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import type { ParityPassResult } from "#src/models/genshinParity/passes/ParityPassResult";

// The pass a frame that stands off reopens: the run of the passes stops at the first one outside its gate, so that pass
// Is the first result not held. None when every pass held, since then no measure reads the difference and the measure
// Set is what is short
export const findReopenedPass = (results: readonly ParityPassResult[]): ParityPass | undefined =>
  results.find((result) => !result.isHeld)?.pass;
