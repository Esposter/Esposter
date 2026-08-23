import { dayjs } from "#src/services/dayjs.test";
import { createOsBackend } from "#src/services/exec/os/createOsBackend";
import { createOsInstallOptions } from "#src/services/exec/os/createOsInstallOptions";
import { resolveSetupCommand } from "#src/services/exec/snapshot/resolveSetupCommand";
import {
  ACCEPTANCE_TIMEOUT_MINUTES,
  ESBUILD_VERSION_REGEX,
  FIND_ESBUILD_BINARY_COMMAND,
  RUN_ESBUILD_VERSION_COMMAND,
} from "#src/services/exec/test/constants.test";
import { createWorkspaceCorpus } from "#src/services/exec/test/createWorkspaceCorpus.test";
import { findRepoRoot } from "#src/services/exec/test/findRepoRoot.test";
import { isSandboxInstallSupported } from "#src/services/exec/test/isSandboxInstallSupported.test";
import { NODE_MODULES_DIRECTORY } from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// Heavy + networked, so it self-gates on sandbox support and a package-manager entrypoint inside that
// Sandbox. On WSL, Corepack provides pnpm without mutating the distro; its cache is bind-mounted below.
describe.skipIf(!isSandboxInstallSupported)("createOsBackend - real workspace install (acceptance)", () => {
  // The whole monorepo's dependency closure materializes well past this many files; a lower count means the
  // Install silently did not complete in the RAM overlay.
  const minimumNodeModulesFileCount = 100_000;
  let corpus = "";

  beforeAll(() => {
    const repositoryRoot = findRepoRoot();
    corpus = createWorkspaceCorpus(repositoryRoot);
  });

  afterAll(() => {
    if (corpus) rmSync(corpus, { force: true, recursive: true });
  });

  test(
    "installs the real dependency closure fully in RAM, runs a native binary, and leaves the host untouched",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBackend();
      // The compound proves: the install succeeds, node_modules fully materialized in RAM (file count), and a native
      // Binary (esbuild's Go executable) actually runs inside the sandbox.
      const command = [
        resolveSetupCommand(),
        `test "$(find . -path '*/${NODE_MODULES_DIRECTORY}/*' -type f | wc -l)" -gt ${minimumNodeModulesFileCount}`,
        FIND_ESBUILD_BINARY_COMMAND,
        RUN_ESBUILD_VERSION_COMMAND,
        `echo ${TEST_FILENAME}`,
      ].join(" && ");
      const { exitCode, stdout } = await exec(command, createOsInstallOptions(corpus, "pipe"));

      expect(exitCode).toBe(0);
      expect(stdout).toContain(TEST_FILENAME);
      expect(stdout).toMatch(ESBUILD_VERSION_REGEX);
      // The subprocess wall held: nothing the install wrote reached the host corpus on disk.
      expect(existsSync(join(corpus, NODE_MODULES_DIRECTORY))).toBe(false);
    },
    dayjs.duration(ACCEPTANCE_TIMEOUT_MINUTES, "minutes").asMilliseconds(),
  );
});
