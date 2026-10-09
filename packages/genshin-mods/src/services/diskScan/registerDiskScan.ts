import type { EngineInterface, On } from "claude-code";

import { getDenyReason, getDiskScanRefusal } from "./getDiskScanRefusal";

// Any failure lets the command through, as the ward's and the delegation guard's do: a guard that blocked on its own
// Failure would block every command after it
const letCommandThrough = <E, R>(_$: EngineInterface, e: E, next: (e: E) => R): R => next(e);

// A Bash command that scans from a root or a home folder is refused before it runs: the scan reads the whole disk for
// A file whose home is known, and the rule is cheapest enforced at the call itself
export const registerDiskScan = (on: On): void => {
  // eslint-disable-next-line no-restricted-syntax -- The engine's registration handler, run when the hook rejects, not a promise
  on("tool.call", { tool: "Bash" }, (_$, e, next) => {
    const refusal = getDiskScanRefusal(e.command);
    return refusal === undefined ? next(e) : { deny: getDenyReason(refusal) };
  }).catch(letCommandThrough);
};
