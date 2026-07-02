import { keyedStringCacheSchema } from "@/models/exec/wsl/KeyedStringCache";
import { getLocalCacheDirectory } from "@/services/exec/util/getLocalCacheDirectory";
import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { join } from "node:path";
// Read a persisted win32 WSL environment probe result (`filename`) for `key`, or undefined when there is nothing
// Usable to reuse — a missing file (first run), unparseable/malformed JSON (corrupt or older shape), or a key
// Mismatch (the host changed). Every undefined branch falls through to a fresh probe, so a bad cache is self-healing,
// Never fatal. The file is untrusted on-disk state, so it is JSON-parsed then zod-validated in one getResult exactly
// Like readCapabilityCache — but stored Windows-side (getLocalCacheDirectory), since resolving the WSL ext4 root is
// Itself one of the probes this caches.
export const readWslEnvironmentCache = (filename: string, key: string): string | undefined =>
  getResult(() =>
    keyedStringCacheSchema.parse(JSON.parse(readFileSync(join(getLocalCacheDirectory(), filename), "utf8"))),
  ).match(
    (cache) => (cache.key === key ? cache.value : undefined),
    () => undefined,
  );
