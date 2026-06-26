import { createOsBackend } from "@/services/exec/createOsBackend";
import { createSharedPackageStoreOptions } from "@/services/exec/createSharedPackageStoreOptions";
import { createWorkspaceCorpus } from "@/services/exec/createWorkspaceCorpus.test";
import { findRepoRoot } from "@/services/exec/findRepoRoot.test";
import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// Heavy + networked + Linux-only, so it self-gates on host support: it runs wherever the os backend is
// Supported (Linux + bubblewrap) and skips everywhere else. No opt-in flag — always exercised when it can.
describe.skipIf(!isOsBackendSupported())("createOsBackend — real workspace install (acceptance)", () => {
  let corpus = "";

  beforeAll(() => {
    const repoRoot = findRepoRoot();
    corpus = createWorkspaceCorpus(repoRoot);
  });

  afterAll(() => {
    if (corpus) rmSync(corpus, { force: true, recursive: true });
  });

  test("installs the real dependency closure fully in RAM, runs a native binary, and leaves the host untouched", async () => {
    expect.hasAssertions();

    const { exec } = createOsBackend();
    // The shared store is writable on the host so downloads are reused; copy import is used because
    // Hardlinks can't cross from the on-disk store into the RAM overlay. The compound proves: the
    // Install (native pacquet binary + build scripts) succeeds, node_modules fully materialized in
    // RAM, and a native binary (esbuild's Go executable) actually runs inside the sandbox.
    const command = [
      "pnpm install --frozen-lockfile",
      `test "$(find . -path '*/node_modules/*' -type f | wc -l)" -gt 100000`,
      "ESBUILD=$(find node_modules/.pnpm -path '*@esbuild+linux-x64*/bin/esbuild' -type f | head -1)",
      `"$ESBUILD" --version`,
      "echo SANDBOX_OK",
    ].join(" && ");
    const sharedPackageStoreOptions = createSharedPackageStoreOptions(corpus);
    const { exitCode, stdout } = await exec(command, {
      ...sharedPackageStoreOptions,
      cwd: corpus,
      isNetworkEnabled: true,
      stdio: "pipe",
    });

    expect(exitCode).toBe(0);
    expect(stdout).toContain("SANDBOX_OK");
    expect(stdout).toMatch(/\d+\.\d+\.\d+/u);
    // The subprocess wall held: nothing the install wrote reached the host corpus on disk.
    expect(existsSync(join(corpus, "node_modules"))).toBe(false);
  }, 180_000);
});
