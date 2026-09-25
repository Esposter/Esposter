import { ACCEPTANCE_CACHE_DIRECTORY_NAME } from "#src/services/exec/util/constants";
import { getDefaultGlobalCacheDirectory } from "#src/services/exec/util/getDefaultGlobalCacheDirectory";
import { join } from "node:path";

// The one cache home every heavy acceptance/equivalence test shares, so the lockfile-hash-keyed warm snapshot is
// Captured once and reused rather than re-installed per file. Anchored on the root `getDefaultGlobalCacheDirectory`
// Picks, which on win32 is WSL-native ext4 — a /mnt/c (v9fs) home makes pnpm's node_modules symlinks fail with EIO —
// Under an `acceptance` leaf the global teardown removes without touching the real cache. Deterministic (NOT mkdtemp)
// So independent workers re-derive the same path with no value crossing the process boundary. A plain `.ts` (not a
// `.test.ts`) so the non-test globalSetup teardown can import it instead of hand-copying the derivation.
export const getAcceptanceCacheHome = (): string =>
  join(getDefaultGlobalCacheDirectory(), ACCEPTANCE_CACHE_DIRECTORY_NAME);
