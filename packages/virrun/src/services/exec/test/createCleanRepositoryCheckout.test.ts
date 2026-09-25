import { createHomeCacheTemporaryDirectory } from "#src/services/exec/test/createHomeCacheTemporaryDirectory.test";
import { execFileSync } from "node:child_process";
import { describe } from "vitest";

// Clones the repo's committed HEAD into a fresh directory with NO node_modules/.nuxt/.virrun (all gitignored, so a
// Clone omits them). The cache-layer bench needs this as its source: a `SourceType.Directory` run over the live repo
// Installs into an already-populated node_modules, so the "cold" install is a warm no-op and measures nothing — the
// Very bug this checkout fixes by giving cold an empty tree its install must actually materialise. A bare local path
// Makes git hardlink the object store (`--local` default) rather than copy — near-instant and near-zero extra disk even
// On a large monorepo, so no `--depth` (which git ignores for local clones anyway, only warning about it).
export const createCleanRepositoryCheckout = (repositoryRoot: string): string => {
  const checkout = createHomeCacheTemporaryDirectory();
  // `--` ends option parsing so the repo path can't be smuggled in as a git flag; `-q` drops the volatile progress
  // Line.
  execFileSync("git", ["clone", "-q", "--", repositoryRoot, checkout]);
  return checkout;
};

describe.todo("createCleanRepositoryCheckout");
