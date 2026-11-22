import type { EngineInterface } from "claude-code";

import { pickTypeSafeKey } from "./pickTypeSafeKey";

// The key sins scores with: the plugin's option, else the TYPESAFE_API_KEY variable, the two places Genshin-persona reads
// Its key from, so one key set the same way serves both plugins
// oxlint-disable-next-line func-style -- A declaration, not an arrow: the hooks module's bundle follows an imported helper that takes `$` into a function declaration
export async function readTypeSafeKey($: EngineInterface, typeSafeKey: string): Promise<string> {
  return pickTypeSafeKey(typeSafeKey, await $.env.get("TYPESAFE_API_KEY"));
}
