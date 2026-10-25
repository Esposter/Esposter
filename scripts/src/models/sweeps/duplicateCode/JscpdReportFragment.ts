import type { DuplicateCodeFragment } from "#src/models/sweeps/duplicateCode/DuplicateCodeFragment";

// One side of a clone as the jscpd report writes it
export interface JscpdReportFragment {
  endLoc: DuplicateCodeFragment["end"];
  name: string;
  startLoc: DuplicateCodeFragment["start"];
}
