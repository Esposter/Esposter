import type { KeyedCache } from "@/models/exec/KeyedCache";

import { writeFileAtomicSync } from "@/services/exec/util/writeFileAtomicSync";
import { getResult } from "@esposter/shared";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
// Persist a probe result so later `virrun -- <cmd>` processes skip the probe. Best-effort: a failure to write
// (read-only home, missing cache root on an exotic host) must never fail the command — the only cost is re-probing
// Next time — so the write is wrapped in getResult and its error discarded. The parent directory is created lazily
// Because a host that has never run virrun has no cache root yet. The write is atomic (temp + rename) so two
// Concurrent `virrun -- <cmd>` processes racing on a cross-process cache can't truncate each other or leave a
// Reader a half-written file.
export const writeKeyedCache = (file: string, cache: KeyedCache<unknown>): void => {
  getResult(() => {
    mkdirSync(dirname(file), { recursive: true });
    writeFileAtomicSync(file, JSON.stringify(cache));
  }).unwrapOr(undefined);
};
