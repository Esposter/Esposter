import { capabilityCacheSchema } from "@/models/exec/os/CapabilityCache";
import { CAPABILITY_CACHE_FILENAME } from "@/services/exec/util/constants";
import { getGlobalCacheDirectory } from "@/services/exec/util/getGlobalCacheDirectory";
import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";
// Read the persisted capability verdict for `key`, or undefined when there is nothing usable to reuse — a missing
// File (first run), unparseable/malformed JSON (corrupt or older shape), or a key mismatch (the host changed). Every
// Undefined branch simply falls through to a fresh probe, so a bad cache is self-healing, never fatal. The file is
// Untrusted on-disk state, so it is JSON-parsed then zod-validated in one getResult exactly like parseOverlayManifest.
export const readCapabilityCache = (key: string): boolean | undefined =>
  getResult(() =>
    capabilityCacheSchema.parse(
      JSON.parse(readFileSync(join(getGlobalCacheDirectory(), CAPABILITY_CACHE_FILENAME), "utf8")),
    ),
  ).match(
    (cache) => (cache.key === key ? cache.supported : undefined),
    () => undefined,
  );
