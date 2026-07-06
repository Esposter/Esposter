import { HOME_CACHE_DIRECTORY_NAME, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { describe } from "vitest";
// Clones the repo's committed HEAD into a fresh dir with NO node_modules/.nuxt/.virrun (all gitignored, so a clone
// Omits them). The cache-layer bench needs this as its source: a `SourceType.Dir` run over the live repo installs into
// An already-populated node_modules, so the "cold" install is a warm no-op and measures nothing — the very bug this
// Checkout fixes by giving cold an empty tree its install must actually materialise. Staged under $HOME, never
// Os.tmpdir, because the sandbox masks /tmp with --tmpfs which would hide it from the command inside (same reason as
// CreateWorkspaceCorpus). A bare local path makes git hardlink the object store (`--local` default) rather than copy —
// Near-instant and near-zero extra disk even on a large monorepo, so no `--depth` (which git ignores for local clones
// Anyway, only warning about it).
export const createCleanRepositoryCheckout = (repoRoot: string): string => {
  const cache = join(homedir(), HOME_CACHE_DIRECTORY_NAME);
  mkdirSync(cache, { recursive: true });
  const checkout = mkdtempSync(join(cache, VIRRUN_TEMP_DIR_PREFIX));
  // `--` ends option parsing so the repo path can't be smuggled in as a git flag; `-q` drops the volatile progress line.
  execFileSync("git", ["clone", "-q", "--", repoRoot, checkout]);
  return checkout;
};

describe.todo("createCleanRepositoryCheckout");
