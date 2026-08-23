import type { z } from "zod";

import { createKeyedCacheSchema } from "#src/models/exec/KeyedCache";
import { parseMachineJson } from "#src/services/exec/util/parseMachineJson";
import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";
// Read the persisted probe result in `file` for `key`, or undefined when there is nothing usable to reuse — a
// Missing file (first run), unparseable/malformed JSON (corrupt or older shape), a key mismatch (the host changed
// Underneath it), or, when the caller bounds it, a value older than `maxAgeMs` (state the key cannot fingerprint
// Drifted). Every undefined branch simply falls through to a fresh probe, so a bad cache is self-healing, never
// Fatal. The file is untrusted on-disk state, so it is JSON-parsed then zod-validated in one getResult exactly
// Like parseOverlayManifest.
export const readKeyedCache = <TValue>(
  file: string,
  valueSchema: z.ZodType<TValue>,
  key: string,
  maxAgeMs?: number,
): TValue | undefined =>
  getResult(() => createKeyedCacheSchema(valueSchema).parse(parseMachineJson(readFileSync(file, "utf8")))).match(
    (cache) => {
      if (cache.key !== key) return undefined;
      else if (maxAgeMs !== undefined && Date.now() - cache.storedAtMs > maxAgeMs) return undefined;
      return cache.value;
    },
    () => undefined,
  );
