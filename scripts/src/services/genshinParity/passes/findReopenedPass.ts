import type { ParityPass } from "#src/models/genshinParity/passes/ParityPass";

import { HELD_NO, PARITY_PASS_ORDER } from "#src/services/genshinParity/passes/constants";
import { getRowPass } from "#src/services/genshinParity/passes/getRowPass";

// The pass a frame that stands off reopens, read from the report the passes last recorded: the first pass in the
// Passes' order with a row outside its gate, since a run stops at the first red one. None when the report holds every
// Pass within its gate, which says the measure set is what is short
export const findReopenedPass = (recordedRows: readonly string[]): ParityPass | undefined =>
  PARITY_PASS_ORDER.find((pass) =>
    recordedRows.some((row) => getRowPass(row) === pass && row.endsWith(`| ${HELD_NO} |`)),
  );
