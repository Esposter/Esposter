import { ACCEPTANCE_CACHE_DIRECTORY_NAME, VIRRUN_CACHE_DIRECTORY_NAME } from "@/services/exec/util/constants";
import { getWslNativeCacheRoot } from "@/services/exec/wsl/getWslNativeCacheRoot";
import { homedir } from "node:os";
import { join } from "node:path";
// The one cache home every heavy acceptance/equivalence test shares, so the lockfile-hash-keyed warm snapshot is
// Captured once and reused rather than re-installed per file. Anchored on the same WSL-native ext4 root
// GetGlobalCacheDirectory picks on win32 — a /mnt/c (v9fs) home makes pnpm's node_modules symlinks fail with EIO —
// Under an `acceptance` leaf the global teardown removes without touching the real cache. Deterministic (NOT mkdtemp)
// So independent workers re-derive the same path with no value crossing the process boundary. A plain `.ts` (not a
// `.test.ts`) so the non-test globalSetup teardown can import it instead of hand-copying the derivation.
export const getAcceptanceCacheHome = (): string =>
  join(
    process.platform === "win32" ? getWslNativeCacheRoot() : join(homedir(), VIRRUN_CACHE_DIRECTORY_NAME),
    ACCEPTANCE_CACHE_DIRECTORY_NAME,
  );
