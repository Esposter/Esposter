import { VIRRUN_CACHE_DIRECTORY_NAME, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { homedir } from "node:os";
import { join } from "node:path";
// The host-global cache root, `~/.virrun` (overridable via VIRRUN_CACHE_HOME). Warm snapshots live here
// Rather than inside the repo for two reasons: a snapshot's overlay layer may not nest inside the source
// Tree it is forked over (overlayfs forbids overlapping lower dirs), and a host-global, lockfile-hash-keyed
// Location lets the same warm snapshot be reused across repos and CI runs (specs/snapshot-fork.md).
export const getGlobalCacheDirectory = (): string =>
  process.env[VIRRUN_CACHE_HOME_KEY] || join(homedir(), VIRRUN_CACHE_DIRECTORY_NAME);
