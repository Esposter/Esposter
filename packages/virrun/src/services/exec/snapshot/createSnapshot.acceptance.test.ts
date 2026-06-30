import { dayjs } from "@/services/dayjs.test";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import {
  ACCEPTANCE_TIMEOUT_MINUTES,
  ESBUILD_VERSION_REGEX,
  FIND_ESBUILD_BINARY_COMMAND,
  PNPM_MODULES_DIRECTORY,
  RUN_ESBUILD_VERSION_COMMAND,
} from "@/services/exec/test/constants.test";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { ensureWarmSnapshot } from "@/services/exec/test/ensureWarmSnapshot.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import { isSandboxInstallSupported } from "@/services/exec/test/isSandboxInstallSupported.test";
import { resolveAcceptanceCacheHome } from "@/services/exec/test/resolveAcceptanceCacheHome.test";
import { NODE_MODULES_DIRECTORY, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// Proves the warm-fork promise: the warm snapshot is captured once (ensureWarmSnapshot) into the shared acceptance
// Cache home, and a fork sees the full node_modules WITHOUT reinstalling (offline, no network) while its own writes
// Vanish, leaving the source corpus untouched. The capture is the same createSnapshot call every other heavy test
// Reuses; this acceptance asserts the captured snapshot exists and behaves. Heavy + networked during capture, so it
// Self-gates exactly like the os-backend install acceptance. The snapshot cache is redirected under $HOME (not
// Os.tmpdir) because the sandbox masks /tmp with --tmpfs, which would hide a /tmp overlay layer from the command
// Inside; the shared global teardown drops it.
describe.skipIf(!isSandboxInstallSupported)("createSnapshot - warm capture then fork (acceptance)", () => {
  const backend = createOsBackend();
  const acceptanceTimeoutMs = dayjs.duration(ACCEPTANCE_TIMEOUT_MINUTES, "minutes").asMilliseconds();
  let corpus = "";
  const previousCacheHome = process.env[VIRRUN_CACHE_HOME_KEY];

  beforeAll(async () => {
    process.env[VIRRUN_CACHE_HOME_KEY] = resolveAcceptanceCacheHome();
    corpus = createWorkspaceCorpus(findRepoRoot());
    await ensureWarmSnapshot(backend, corpus);
  }, acceptanceTimeoutMs);

  afterAll(() => {
    // The shared snapshot + cache home are owned by the global teardown; here only the per-file corpus is dropped.
    if (previousCacheHome === undefined) delete process.env[VIRRUN_CACHE_HOME_KEY];
    else process.env[VIRRUN_CACHE_HOME_KEY] = previousCacheHome;
    if (corpus) rmSync(corpus, { force: true, recursive: true });
  });

  test("the captured snapshot exists, a fork reuses node_modules offline, and the source stays clean", async () => {
    expect.hasAssertions();

    // The shared capture wrote into the snapshot, not the source corpus on disk.
    const location = resolveSnapshotLocation(corpus);

    expect(location.exists).toBe(true);
    expect(existsSync(join(corpus, NODE_MODULES_DIRECTORY))).toBe(false);

    // Fork: stack the frozen snapshot read-only over the source, offline and with no shared store. The run sees the
    // Full dependency closure (no reinstall) and a native binary (esbuild) executes; its own write vanishes in tmpfs.
    const forkCommand = [
      `test -d ${PNPM_MODULES_DIRECTORY}`,
      FIND_ESBUILD_BINARY_COMMAND,
      'test -n "$ESBUILD"',
      RUN_ESBUILD_VERSION_COMMAND,
      `printf "" > ${TEST_FILENAME}`,
      `echo ${TEST_FILENAME}`,
    ].join(" && ");
    const { exitCode, stdout } = await backend.exec(forkCommand, {
      cwd: corpus,
      overlayLayers: { lowerDirs: [location.upperDir] },
      stdio: "pipe",
    });

    expect(exitCode).toBe(0);
    expect(stdout).toContain(TEST_FILENAME);
    expect(stdout).toMatch(ESBUILD_VERSION_REGEX);
    expect(existsSync(join(corpus, TEST_FILENAME))).toBe(false);
  }, acceptanceTimeoutMs);
});
