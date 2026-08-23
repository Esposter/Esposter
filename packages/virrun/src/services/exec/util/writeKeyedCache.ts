import type { KeyedCache } from "#src/models/exec/KeyedCache";

import { writeFileAtomicSync } from "#src/services/exec/util/writeFileAtomicSync";
import { getResult } from "@esposter/shared";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
// Persist a probe result so later `virrun -- <cmd>` processes skip the probe. The capture time is stamped here rather
// Than taken from the caller so every persisted entry is age-boundable (readKeyedCache's maxAgeMs) and no probe can
// Forget to record it. Best-effort: a failure to write (read-only home, missing cache root on an exotic host) must
// Never fail the command — the only cost is re-probing next time — so the write is wrapped in getResult and its error
// Discarded. The parent directory is created lazily because a host that has never run virrun has no cache root yet.
// The write is atomic (temp + rename) so two concurrent `virrun -- <cmd>` processes racing on a cross-process cache
// Can't truncate each other or leave a reader a half-written file.
export const writeKeyedCache = (file: string, cache: Pick<KeyedCache<unknown>, "key" | "value">): void => {
  getResult(() => {
    mkdirSync(dirname(file), { recursive: true });
    writeFileAtomicSync(file, JSON.stringify({ ...cache, storedAtMs: Date.now() }));
  }).unwrapOr(undefined);
};
