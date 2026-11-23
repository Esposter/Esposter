import type { EngineInterface } from "claude-code";

import { settlePress } from "./settlePress";

// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export function press($: EngineInterface, action: () => Promise<unknown>): () => void {
  return () => {
    // The press slot is the engine's and returns
    // oxlint-disable-next-line typescript/no-floating-promises -- nothing, and settlePress settles every outcome itself
    settlePress($, action);
  };
}
