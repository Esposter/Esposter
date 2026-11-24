import type { EngineInterface } from "claude-code";

import { atom, update } from "claude-code";

import { WARM_QUESTION } from "../constants";
import { InitialState } from "../InitialState";

const lastCacheRequestAtAtom = atom(
  { key: "lastCacheRequestAt", plugin: "genshin-mods" } as const,
  InitialState.lastCacheRequestAt,
);
const nowAtom = atom({ key: "now", plugin: "genshin-mods" } as const, InitialState.now);
// A fork re-sends the conversation's prefix, which renews the cache from the moment it is sent, and adds no row to the
// Transcript
/* oxlint-disable-next-line func-style -- A declaration, not an arrow: the hooks module's bundle follows an imported
   helper that takes `$` only into a function declaration */
export async function warmCache($: EngineInterface): Promise<void> {
  const requestedAt = await $.clock.now();
  const answer = await $.model.fork({ prompt: WARM_QUESTION });
  if (!answer.isAnswered) {
    $.ui.toast(`The cache was not warmed: ${answer.reason}.`);
    return;
  }

  await update($, lastCacheRequestAtAtom, () => requestedAt);
  await update($, nowAtom, () => requestedAt);
}
