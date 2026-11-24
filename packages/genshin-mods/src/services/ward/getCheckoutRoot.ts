import type { EngineInterface } from "claude-code";

import { findCheckoutRoot } from "./findCheckoutRoot";

// The checkout a session's git commands run in: the folder with the `.git`, or the session's own folder where none is
/* oxlint-disable-next-line func-style -- A declaration, not an arrow: the hooks module's bundle follows an imported
   helper that takes `$` only into a function declaration */
export async function getCheckoutRoot($: EngineInterface, cwd: string): Promise<string> {
  return (await findCheckoutRoot($, cwd)) ?? cwd;
}
