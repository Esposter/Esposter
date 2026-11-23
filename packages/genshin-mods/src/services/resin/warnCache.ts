import type { EngineInterface } from "claude-code";

import { atom, read, update } from "claude-code";

import { CACHE_WARNING_MS } from "../constants";
import { InitialState } from "../InitialState";
import { turnState } from "../turnState";
import { getCacheRemainingMs } from "./getCacheRemainingMs";

// The cache request whose expiry was last warned about, so each request warns once
let warnedLastCacheRequestAt = 0;

const enabledModsAtom = atom({ key: "enabledMods", plugin: "genshin-mods" } as const, InitialState.enabledMods);
// The engine traces a state reference only to an atom made in its own file, so a file declares the atoms it reads.
// These copies of another file's atoms are required, and the duplicate-code gate skips them
// `jscpd:ignore-start`
const lastCacheRequestAtAtom = atom(
  { key: "lastCacheRequestAt", plugin: "genshin-mods" } as const,
  InitialState.lastCacheRequestAt,
);
const nowAtom = atom({ key: "now", plugin: "genshin-mods" } as const, InitialState.now);
// `jscpd:ignore-end` The cache goes cold at a known instant, so its warning is one timer armed for that instant at each
// Turn's end, from the Request that last read or wrote the cache, rather than a check on a clock. The timer warns once
// For that request, and Stands down while a turn runs, since that turn's end arms it again. A timer left from an
// Earlier turn finds the cache Renewed and does nothing more than the warning it would have given
// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export async function warnCache($: EngineInterface): Promise<void> {
  const now = await $.clock.now();
  await update($, nowAtom, () => now);
  const lastCacheRequestAt = await read($, lastCacheRequestAtAtom);
  const remainingMs = getCacheRemainingMs(lastCacheRequestAt, now);
  const isWarningDue = lastCacheRequestAt > 0 && remainingMs > 0 && remainingMs <= CACHE_WARNING_MS;
  if (
    !isWarningDue ||
    turnState.isTurnRunning ||
    warnedLastCacheRequestAt === lastCacheRequestAt ||
    !(await read($, enabledModsAtom)).resin
  )
    return;

  warnedLastCacheRequestAt = lastCacheRequestAt;
  const minutes = Temporal.Duration.from({ milliseconds: CACHE_WARNING_MS }).total("minutes");
  $.ui.toast(`The prompt cache goes cold in ${minutes} minutes: warm it, compact or hand off from the band.`);
}
