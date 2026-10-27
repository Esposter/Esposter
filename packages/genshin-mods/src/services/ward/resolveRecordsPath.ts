import type { EngineInterface } from "claude-code";

import { readHome } from "../readHome";
import { getRecordsPath } from "./getRecordsPath";

// The records file under the person's home folder, the home read from the engine's environment lookup
// oxlint-disable-next-line func-style -- A declaration, not an arrow: the hooks module's bundle follows an imported helper that takes `$` only into a function declaration
export async function resolveRecordsPath($: EngineInterface): Promise<string> {
  return getRecordsPath(await readHome($));
}
