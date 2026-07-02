import type { KeyedStringCache } from "@/models/exec/KeyedStringCache";

import { getLocalCacheDirectory } from "@/services/exec/util/getLocalCacheDirectory";
import { writeFileAtomicSync } from "@/services/exec/util/writeFileAtomicSync";
import { getResult } from "@esposter/shared";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
// Persist a win32 WSL environment probe result (`filename`) so later `virrun -- <cmd>` processes skip the probe.
// Best-effort: a failure to write (read-only home, missing cache root) must never fail the command — the only cost is
// Re-probing next time — so the write is wrapped in getResult and its error discarded. Stored Windows-side
// (getLocalCacheDirectory), created lazily because a host that has never run virrun has no ~/.virrun yet. Callers
// Persist only a SUCCESSFUL probe, so a transient WSL failure re-probes next run rather than caching the degraded
// Default. The write is atomic (temp + rename) so two concurrent `virrun -- <cmd>` processes racing on this
// Cross-process cache can't truncate each other or leave a reader a half-written file.
export const writeWslEnvironmentCache = (filename: string, cache: KeyedStringCache): void => {
  getResult(() => {
    const cacheDirectory = getLocalCacheDirectory();
    mkdirSync(cacheDirectory, { recursive: true });
    writeFileAtomicSync(join(cacheDirectory, filename), JSON.stringify(cache));
  }).unwrapOr(undefined);
};
