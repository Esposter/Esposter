/* eslint-disable vitest/require-top-level-describe */
import type { ExecBackend } from "@/models/exec/ExecBackend";

import { dayjs } from "@/services/dayjs.test";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { ACCEPTANCE_TIMEOUT_MINUTES } from "@/services/exec/test/constants.test";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { ensureWarmSnapshot } from "@/services/exec/test/ensureWarmSnapshot.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import { getAcceptanceCacheHome } from "@/services/exec/test/getAcceptanceCacheHome";
import { VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe } from "vitest";
// The shared beforeAll/afterAll behind every heavy warm-snapshot acceptance/equivalence suite: point the cache home
// At the shared acceptance location, build the workspace corpus, and capture-or-reuse the warm snapshot once. The
// Backend is constructed lazily in beforeAll (which never runs for a skipped describe) rather than at describe scope:
// Vitest still executes a skipIf'd describe body to collect its tests, and createOsBackend throws on a host that
// Can't set up the overlay (e.g. the suite running nested inside the os-backend sandbox), which would fail collection
// Instead of skipping. The shared snapshot + cache home are owned by the global teardown; only the per-file corpus is
// Dropped here. Extra per-suite setup goes in the suite's own beforeAll — it runs after this one.
export const setupWarmSnapshotSuite = (): { getBackend: () => ExecBackend; getCorpus: () => string } => {
  let backend: ExecBackend;
  let corpus = "";
  const previousCacheHome = process.env[VIRRUN_CACHE_HOME_KEY];

  beforeAll(async () => {
    backend = createOsBackend();
    process.env[VIRRUN_CACHE_HOME_KEY] = getAcceptanceCacheHome();
    corpus = createWorkspaceCorpus(findRepoRoot());
    await ensureWarmSnapshot(backend, corpus);
  }, dayjs.duration(ACCEPTANCE_TIMEOUT_MINUTES, "minutes").asMilliseconds());

  afterAll(() => {
    if (previousCacheHome === undefined) delete process.env[VIRRUN_CACHE_HOME_KEY];
    else process.env[VIRRUN_CACHE_HOME_KEY] = previousCacheHome;
    if (corpus) rmSync(corpus, { force: true, recursive: true });
  });

  return { getBackend: () => backend, getCorpus: () => corpus };
};

describe.todo("setupWarmSnapshotSuite");
