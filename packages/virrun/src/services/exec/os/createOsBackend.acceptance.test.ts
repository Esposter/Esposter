import { dayjs } from "@/services/dayjs.test";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import {
  ACCEPTANCE_TIMEOUT_MINUTES,
  ESBUILD_VERSION_REGEX,
  FIND_ESBUILD_BINARY_COMMAND,
  NODE_MODULES_DIRECTORY,
  RUN_ESBUILD_VERSION_COMMAND,
} from "@/services/exec/test/constants.test";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import { isSandboxInstallSupported } from "@/services/exec/test/isSandboxInstallSupported.test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// Heavy + networked, so it self-gates on sandbox support and a package-manager entrypoint inside that
// Sandbox. On WSL, Corepack provides pnpm without mutating the distro; its cache is bind-mounted below.
describe.skipIf(!isSandboxInstallSupported)("createOsBackend - real workspace install (acceptance)", () => {
  // The whole monorepo's dependency closure materializes well past this many files; a lower count means the
  // Install silently did not complete in the RAM overlay.
  const minNodeModulesFileCount = 100000;
  const sandboxOkMarker = "SANDBOX_OK";
  let corpus = "";

  beforeAll(() => {
    const repoRoot = findRepoRoot();
    corpus = createWorkspaceCorpus(repoRoot);
  });

  afterAll(() => {
    if (corpus) rmSync(corpus, { force: true, recursive: true });
  });

  test(
    "installs the real dependency closure fully in RAM, runs a native binary, and leaves the host untouched",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBackend();
      // CreateOsInstallOptions wires the shared store (writable on the host so downloads are reused; copy import
      // Because hardlinks can't cross from the on-disk store into the RAM overlay), the corepack home, network,
      // And the login PATH — the same options createVirrun provisions a snapshot with. The compound proves: the
      // Install (native pacquet binary + build scripts) succeeds, node_modules fully materialized in RAM, and a
      // Native binary (esbuild's Go executable) actually runs inside the sandbox.
      const command = [
        resolveSetupCommand(),
        `test "$(find . -path '*/${NODE_MODULES_DIRECTORY}/*' -type f | wc -l)" -gt ${minNodeModulesFileCount}`,
        FIND_ESBUILD_BINARY_COMMAND,
        RUN_ESBUILD_VERSION_COMMAND,
        `echo ${sandboxOkMarker}`,
      ].join(" && ");
      const { exitCode, stdout } = await exec(command, createOsInstallOptions(corpus, "pipe"));

      expect(exitCode).toBe(0);
      expect(stdout).toContain(sandboxOkMarker);
      expect(stdout).toMatch(ESBUILD_VERSION_REGEX);
      // The subprocess wall held: nothing the install wrote reached the host corpus on disk.
      expect(existsSync(join(corpus, NODE_MODULES_DIRECTORY))).toBe(false);
      // A real, frozen-lockfile install of the whole workspace corpus into a RAM overlay routinely runs past
      // The smaller default caps on a cold store, so allow the long acceptance timeout before failing.
    },
    dayjs.duration(ACCEPTANCE_TIMEOUT_MINUTES, "minutes").asMilliseconds(),
  );
});
