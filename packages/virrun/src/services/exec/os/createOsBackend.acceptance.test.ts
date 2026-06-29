import { dayjs } from "@/services/dayjs.test";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { createSharedPackageStoreOptions } from "@/services/exec/store/createSharedPackageStoreOptions";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import {
  COREPACK_HOME_KEY,
  VIRRUN_CACHE_DIRECTORY_NAME,
  VIRRUN_COREPACK_STORE_DIRECTORY_NAME,
  VIRRUN_STORE_DIRECTORY_NAME,
} from "@/services/exec/util/constants";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const isSandboxInstallSupported =
  isOsBackendSupported() &&
  getResult(() =>
    process.platform === "win32"
      ? execFileSync("wsl.exe", ["--exec", "sh", "-lc", "command -v node && node --version && corepack --version"], {
          stdio: "pipe",
        })
      : execFileSync("sh", ["-lc", "command -v pnpm"], { stdio: "pipe" }),
  ).match(
    () => true,
    () => false,
  );

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
      // The shared store is writable on the host so downloads are reused; copy import is used because
      // Hardlinks can't cross from the on-disk store into the RAM overlay. The compound proves: the
      // Install (native pacquet binary + build scripts) succeeds, node_modules fully materialized in
      // RAM, and a native binary (esbuild's Go executable) actually runs inside the sandbox.
      const installCommand = process.platform === "win32" ? "corepack pnpm install" : "pnpm install";
      const command = [
        `${installCommand} --frozen-lockfile`,
        `test "$(find . -path '*/node_modules/*' -type f | wc -l)" -gt 100000`,
        "ESBUILD=$(find node_modules/.pnpm -path '*/bin/esbuild' -type f | head -1)",
        `"$ESBUILD" --version`,
        "echo SANDBOX_OK",
      ].join(" && ");
      const cacheRoot = join(corpus, VIRRUN_CACHE_DIRECTORY_NAME);
      const sharedPackageStoreOptions = createSharedPackageStoreOptions(corpus, cacheRoot);
      const corepackHome = join(cacheRoot, VIRRUN_STORE_DIRECTORY_NAME, VIRRUN_COREPACK_STORE_DIRECTORY_NAME);
      mkdirSync(corepackHome, { recursive: true });
      const { exitCode, stdout } = await exec(command, {
        ...sharedPackageStoreOptions,
        bindDirs: [...(sharedPackageStoreOptions.bindDirs ?? []), corepackHome],
        cwd: corpus,
        env: {
          ...sharedPackageStoreOptions.env,
          [COREPACK_HOME_KEY]: corepackHome,
        },
        isNetworkEnabled: true,
        stdio: "pipe",
      });

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
