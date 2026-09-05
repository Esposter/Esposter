import type { ExecOptions } from "#src/models/exec/ExecOptions";

import { createOsExecOptions } from "#src/services/exec/os/createOsExecOptions";
import { createOsInstallOptions } from "#src/services/exec/os/createOsInstallOptions";
import { forkSnapshot } from "#src/services/exec/snapshot/forkSnapshot";
import { resolveSetupCommand } from "#src/services/exec/snapshot/resolveSetupCommand";
import {
  ACCEPTANCE_TIMEOUT_MINUTES,
  ESBUILD_VERSION_REGEX,
  FIND_ESBUILD_BINARY_COMMAND,
  PNPM_MODULES_DIRECTORY,
  RUN_ESBUILD_VERSION_COMMAND,
} from "#src/services/exec/test/constants.test";
import { setupWarmSnapshotSuite } from "#src/services/exec/test/setupWarmSnapshotSuite.test";
import { describe, expect, test } from "vitest";

// Correctness layer 4 snapshot/fork equivalence (specs/correctness.md): a forked warm sandbox must be observably
// Identical to a freshly booted + installed one. The only variable is how the dependency closure is presented —
// Warm fork (frozen overlay upper stacked read-only) vs cold in-place install. Install output is discarded so only
// The verify command's output is diffed; nothing is normalized, so no real divergence can hide.
// Each case boots a sandbox and runs a full cold install, so the pair costs minutes of wall clock — too slow for
// The default suite. The body is kept intact; drop the `.todo` to run it when the fork or overlay layering changes.
describe.todo("forkSnapshot - warm fork matches a cold in-place install (equivalence)", () => {
  const { getBackend, getCorpus } = setupWarmSnapshotSuite();
  const runWarmVsCold = async (command: string, warmOptions: ExecOptions, coldOptions: ExecOptions) => {
    const warmResult = await forkSnapshot(getBackend(), command, warmOptions);
    const coldResult = await getBackend().exec(`${resolveSetupCommand()} > /dev/null 2>&1 && ${command}`, coldOptions);
    return { coldResult, warmResult };
  };

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

    const { coldResult, warmResult } = await runWarmVsCold(
      verifyCommand,
      createOsExecOptions(getCorpus(), "pipe"),
      createOsInstallOptions(getCorpus(), "pipe"),
    );

    expect(warmResult.exitCode).toBe(0);
    expect(coldResult.exitCode).toBe(0);
    expect(warmResult.stdout).toMatch(ESBUILD_VERSION_REGEX);
    expect(warmResult).toStrictEqual(coldResult);
  }, Temporal.Duration.from({ minutes: ACCEPTANCE_TIMEOUT_MINUTES }).total("milliseconds"));

  // The pre-run dependency verification pnpm does may auto-install inside the sandbox and fail when writing bin shims into the
  // Overlay upper (ENOENT node_modules/.bin/*). A warm fork resolves the binary from the frozen snapshot instead.
  test("a forked warm `pnpm exec` runs over the frozen deps without re-installing and matches a cold install", async () => {
    expect.hasAssertions();

    // Corepack pnpm (not the raw binary find the case above uses) so the run actually traverses verify-deps-before-run,
    // Then `node --version` as the payload — a command pnpm exec always resolves off PATH, so a non-zero exit means the
    // Pre-run verification tripped an install, not a missing hoisted bin. createOsInstallOptions binds the corepack home
    // Both sides need to resolve `corepack pnpm`. ESBUILD_VERSION_REGEX is a bare semver, so it matches node's `vX.Y.Z`.
    const execCommand = "corepack pnpm exec node --version";
    const { coldResult, warmResult } = await runWarmVsCold(
      execCommand,
      createOsInstallOptions(getCorpus(), "pipe"),
      createOsInstallOptions(getCorpus(), "pipe"),
    );

    expect(warmResult.exitCode).toBe(0);
    expect(coldResult.exitCode).toBe(0);
    expect(warmResult.stdout).toMatch(ESBUILD_VERSION_REGEX);
    expect(warmResult.stdout).toBe(coldResult.stdout);
  }, Temporal.Duration.from({ minutes: ACCEPTANCE_TIMEOUT_MINUTES }).total("milliseconds"));
});
