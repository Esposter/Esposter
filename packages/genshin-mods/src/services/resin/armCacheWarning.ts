import type { EngineInterface } from "claude-code";

import { atom, read } from "claude-code";

import { InitialState } from "../InitialState";
import { runDetached } from "../runDetached";
import { getCacheWarningDelayMs } from "./getCacheWarningDelayMs";
import { warnCache } from "./warnCache";

const lastCacheRequestAtAtom = atom(
  { key: "lastCacheRequestAt", plugin: "genshin-mods" } as const,
  InitialState.lastCacheRequestAt,
);
// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export async function armCacheWarning($: EngineInterface): Promise<void> {
  const delayMs = getCacheWarningDelayMs(await read($, lastCacheRequestAtAtom), await $.clock.now());
  if (delayMs === undefined) return;

  $.clock.after(delayMs, () => {
    runDetached(() => warnCache($));
  });
}
