import type { z } from "zod";

import { createKeyedCacheSchema } from "#src/models/exec/KeyedCache";
import { PROBE_CACHE_MAX_AGE_MS } from "#src/services/exec/util/constants";
import { parseMachineJson } from "#src/services/exec/util/parseMachineJson";
import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";

// Read the persisted probe result in `file` for `key`, or undefined when there is nothing usable to reuse — a
// Missing file (first run), unparseable/malformed JSON (corrupt or older shape), a key mismatch (the host changed
// Underneath it), or a value older than `PROBE_CACHE_MAX_AGE_MS` (state the key cannot fingerprint drifted). The
// Bound is not a parameter, so no probe cache can be read without it. Every undefined branch falls through to a
// Fresh probe, so a bad cache is self-healing, never fatal. The file is untrusted on-disk state, so it is
// JSON-parsed then zod-validated in one getResult exactly like parseOverlayManifest.
export const readKeyedCache = <TValue>(file: string, valueSchema: z.ZodType<TValue>, key: string): TValue | undefined =>
  getResult(() => createKeyedCacheSchema(valueSchema).parse(parseMachineJson(readFileSync(file, "utf8")))).match(
    (cache) => {
      if (cache.key !== key || Date.now() - cache.storedAtMs > PROBE_CACHE_MAX_AGE_MS) return undefined;
      else return cache.value;
    },
    () => undefined,
  );
