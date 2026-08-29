import { resolveSnapshotLocation } from "#src/services/exec/snapshot/resolveSnapshotLocation";
import {
  ACCEPTANCE_TIMEOUT_MINUTES,
  ESBUILD_VERSION_REGEX,
  FIND_ESBUILD_BINARY_COMMAND,
  PNPM_MODULES_DIRECTORY,
  RUN_ESBUILD_VERSION_COMMAND,
} from "#src/services/exec/test/constants.test";
import { isSandboxInstallSupported } from "#src/services/exec/test/isSandboxInstallSupported.test";
import { setupWarmSnapshotSuite } from "#src/services/exec/test/setupWarmSnapshotSuite.test";
import { NODE_MODULES_DIRECTORY } from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { MINUTE } from "@esposter/shared";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// Proves the warm-fork promise: the warm snapshot is captured once (ensureWarmSnapshot) into the shared acceptance
// Cache home, and a fork sees the full node_modules WITHOUT reinstalling (offline, no network) while its own writes
// Vanish, leaving the source corpus untouched. The capture is the same createSnapshot call every other heavy test
// Reuses; this acceptance asserts the captured snapshot exists and behaves. Heavy + networked during capture, so it
// Self-gates exactly like the os-backend install acceptance. The snapshot cache is redirected under $HOME (not
// Os.tmpdir) because the sandbox masks /tmp with --tmpfs, which would hide a /tmp overlay layer from the command
// Inside; the shared global teardown drops it.
describe.skipIf(!isSandboxInstallSupported)("createSnapshot - warm capture then fork (acceptance)", () => {
  const { getBackend, getCorpus } = setupWarmSnapshotSuite();
  const acceptanceTimeoutMs = ACCEPTANCE_TIMEOUT_MINUTES * MINUTE;

  test("the captured snapshot exists, a fork reuses node_modules offline, and the source stays clean", async () => {
    expect.hasAssertions();

    const corpus = getCorpus();
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
    const { exitCode, stdout } = await getBackend().exec(forkCommand, {
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
