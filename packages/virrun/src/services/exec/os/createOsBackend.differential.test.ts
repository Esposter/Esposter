import { assertDifferential } from "#src/services/exec/differential/assertDifferential.test";
import { SHELL_DIFFERENTIAL_CORPUS } from "#src/services/exec/differential/differentialCorpus.test";
import { checkIsOsBackendSupported } from "#src/services/exec/os/checkIsOsBackendSupported";
import { createOsBackend } from "#src/services/exec/os/createOsBackend";
import { ACCEPTANCE_TIMEOUT_MINUTES } from "#src/services/exec/test/constants.test";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { createOsBaselineBackend } from "#src/services/exec/wsl/createOsBaselineBackend.test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

// Compares the observable command result (exit code + stdout + stderr) against native - not host disk
// Side-effects, since the os backend intentionally hides writes from the host. The isolation contract
// Is asserted separately below. See packages/app/content/docs/virrun/correctness.md.
describe.skipIf(!checkIsOsBackendSupported())(createOsBackend, () => {
  const native = createOsBaselineBackend();
  const temporaryDirectories = createTemporaryDirectoryTracker();
  // Each case spawns a real bwrap sandbox (win32: over the wsl.exe bridge). In isolation that is ~1-3s, but the suite
  // Runs test files across 16 workers all contending for the one shared WSL bridge, so a single exec can wait well
  // Past vitest's 5s default. Use the same hang-ceiling the acceptance/property os tests already carry — the exec is
  // Not the slow part, the contention is.
  const acceptanceTimeoutMs = Temporal.Duration.from({ minutes: ACCEPTANCE_TIMEOUT_MINUTES }).total("milliseconds");

  afterEach(() => {
    temporaryDirectories.cleanup();
  });

  test.each(SHELL_DIFFERENTIAL_CORPUS)(
    "matches the native backend for $name",
    async ({ command, rules }) => {
      expect.hasAssertions();

      await assertDifferential(createOsBackend(), native, command, rules);
    },
    acceptanceTimeoutMs,
  );

  test(
    "a write inside the sandbox never touches the host disk",
    async () => {
      expect.hasAssertions();

      const directory = temporaryDirectories.create();
      const os = createOsBackend();

      const writeResult = await os.exec(`echo x > ${TEST_FILENAME}`, { cwd: directory, stdio: "pipe" });

      expect(writeResult.exitCode).toBe(0);
      expect(existsSync(join(directory, TEST_FILENAME))).toBe(false);

      // A fresh exec gets a fresh RAM upper, so the previous run's write is gone there too.
      const readResult = await os.exec(`cat ${TEST_FILENAME}`, { cwd: directory, stdio: "pipe" });

      expect(readResult.exitCode).not.toBe(0);
    },
    acceptanceTimeoutMs,
  );
});
