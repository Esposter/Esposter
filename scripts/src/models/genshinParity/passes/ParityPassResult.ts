import type { ParityPass } from "#src/models/genshinParity/passes/ParityPass";
import type { ParityPassMeasure } from "#src/models/genshinParity/passes/ParityPassMeasure";

// One pass of a run: what its measure read, and whether every reading held its gate
export interface ParityPassResult {
  isHeld: boolean;
  measure: ParityPassMeasure;
  pass: ParityPass;
}
