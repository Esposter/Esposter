import { dayjs } from "@/services/dayjs.test";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createOsExecOptions } from "@/services/exec/os/createOsExecOptions";
import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { forkSnapshot } from "@/services/exec/snapshot/forkSnapshot";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
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
import { getAcceptanceCacheHome } from "@/services/exec/test/getAcceptanceCacheHome";
import { isSandboxInstallSupported } from "@/services/exec/test/isSandboxInstallSupported.test";
import { VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// Correctness layer 4 snapshot/fork equivalence (specs/correctness.md): a forked warm sandbox must be observably
// Identical to a freshly booted + installed one. The only variable is how the dependency closure is presented —
// Warm fork (frozen overlay upper stacked read-only) vs cold in-place install. Install output is discarded so only
// The verify command's output is diffed; nothing is normalized, so no real divergence can hide.
describe.skipIf(!isSandboxInstallSupported)("forkSnapshot - warm fork matches a cold in-place install (equivalence)", () => {
  const backend = createOsBackend();
  let corpus = "";
  const previousCacheHome = process.env[VIRRUN_CACHE_HOME_KEY];

  beforeAll(async () => {
    process.env[VIRRUN_CACHE_HOME_KEY] = getAcceptanceCacheHome();
    corpus = createWorkspaceCorpus(findRepoRoot());
    await ensureWarmSnapshot(backend, corpus);
  }, dayjs.duration(ACCEPTANCE_TIMEOUT_MINUTES, "minutes").asMilliseconds());

  afterAll(() => {
    // The shared snapshot + cache home are owned by the global teardown; here only the per-file corpus is dropped.
    if (previousCacheHome === undefined) delete process.env[VIRRUN_CACHE_HOME_KEY];
    else process.env[VIRRUN_CACHE_HOME_KEY] = previousCacheHome;
    if (corpus) rmSync(corpus, { force: true, recursive: true });
  });

  test("a forked warm run produces the identical observable result as a cold in-place install", async () => {
    expect.hasAssertions();

    // Hash the sorted top-level .pnpm listing (catches a fork exposing a different package set), then run esbuild's
    // Native binary and print its version (catches a fork that fails to expose the native binary through the lower).
    const verifyCommand = [
      `test -d ${PNPM_MODULES_DIRECTORY}`,
      `find ${PNPM_MODULES_DIRECTORY} -maxdepth 1 | LC_ALL=C sort | sha256sum`,
      FIND_ESBUILD_BINARY_COMMAND,
      'test -n "$ESBUILD"',
      RUN_ESBUILD_VERSION_COMMAND,
    ].join(" && ");

    // Warm: fork the verify over the shared frozen snapshot (no reinstall).
    const warmResult = await forkSnapshot(backend, verifyCommand, createOsExecOptions(corpus, "pipe"));

    // Cold: a fresh ephemeral session installs in place then runs the same verify; reuses the now-warm shared store.
    const coldResult = await backend.exec(
      `${resolveSetupCommand()} > /dev/null 2>&1 && ${verifyCommand}`,
      createOsInstallOptions(corpus, "pipe"),
    );

    expect(warmResult.exitCode).toBe(0);
    expect(coldResult.exitCode).toBe(0);
    expect(warmResult.stdout).toMatch(ESBUILD_VERSION_REGEX);
    expect(warmResult).toStrictEqual(coldResult);
  }, dayjs.duration(ACCEPTANCE_TIMEOUT_MINUTES, "minutes").asMilliseconds());
});
