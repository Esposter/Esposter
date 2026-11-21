import type { On } from "claude-code";

import { letThrough } from "../letThrough";
import { getDenyReason } from "./getDenyReason";
import { getDiskScanRefusal } from "./getDiskScanRefusal";

// A Bash command that scans from a root or a home folder is refused before it runs: the scan reads the whole disk for
// A file whose home is known, and the rule is cheapest enforced at the call itself
export const registerDiskScan = (on: On): void => {
  // eslint-disable-next-line no-restricted-syntax -- The engine's registration handler, run when the hook rejects, not a promise
  on("tool.call", { tool: "Bash" }, (_$, e, next) => {
    const refusal = getDiskScanRefusal(e.command);
    return refusal === undefined ? next(e) : { deny: getDenyReason(refusal) };
  }).catch(letThrough);
};
