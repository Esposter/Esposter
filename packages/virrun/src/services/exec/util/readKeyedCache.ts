import type { z } from "zod";

import { createKeyedCacheSchema } from "@/models/exec/KeyedCache";
import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";
// Read the persisted probe result in `file` for `key`, or undefined when there is nothing usable to reuse — a
// Missing file (first run), unparseable/malformed JSON (corrupt or older shape), or a key mismatch (the host changed
// Underneath it). Every undefined branch simply falls through to a fresh probe, so a bad cache is self-healing,
// Never fatal. The file is untrusted on-disk state, so it is JSON-parsed then zod-validated in one getResult exactly
// Like parseOverlayManifest.
export const readKeyedCache = <TValue>(file: string, valueSchema: z.ZodType<TValue>, key: string): TValue | undefined =>
  getResult(() => createKeyedCacheSchema(valueSchema).parse(JSON.parse(readFileSync(file, "utf8")))).match(
    (cache) => (cache.key === key ? cache.value : undefined),
    () => undefined,
  );
