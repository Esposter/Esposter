import { dayjs } from "@/services/dayjs.test";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import { isSandboxInstallSupported } from "@/services/exec/test/isSandboxInstallSupported.test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// Heavy + networked, so it self-gates on sandbox support and a package-manager entrypoint inside that
// Sandbox. On WSL, Corepack provides pnpm without mutating the distro; its cache is bind-mounted below.
describe.skipIf(!isSandboxInstallSupported)("createOsBackend - real workspace install (acceptance)", () => {
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
        `test "$(find . -path '*/node_modules/*' -type f | wc -l)" -gt 100000`,
        "ESBUILD=$(find node_modules/.pnpm -path '*/bin/esbuild' -type f | head -1)",
        `"$ESBUILD" --version`,
        "echo SANDBOX_OK",
      ].join(" && ");
      const { exitCode, stdout } = await exec(command, createOsInstallOptions(corpus, "pipe"));

      expect(exitCode).toBe(0);
      expect(stdout).toContain("SANDBOX_OK");
      expect(stdout).toMatch(/\d+\.\d+\.\d+/u);
      // The subprocess wall held: nothing the install wrote reached the host corpus on disk.
      expect(existsSync(join(corpus, "node_modules"))).toBe(false);
      // A real, frozen-lockfile install of the whole workspace corpus into a RAM overlay (>100k files) routinely
      // Runs past the smaller default caps on a cold store, so allow up to 10 minutes before failing.
    },
    dayjs.duration(10, "minutes").asMilliseconds(),
  );
});
