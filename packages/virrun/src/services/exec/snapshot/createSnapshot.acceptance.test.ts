import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { createSharedPackageStoreOptions } from "@/services/exec/store/createSharedPackageStoreOptions";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import {
  COREPACK_HOME_KEY,
  VIRRUN_CACHE_HOME_KEY,
  VIRRUN_COREPACK_STORE_DIRECTORY_NAME,
  VIRRUN_TEMP_DIR_PREFIX,
} from "@/services/exec/util/constants";
import { getRepoCacheDirectory } from "@/services/exec/util/getRepoCacheDirectory";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { homedir } from "node:os";
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

// Proves the warm-fork promise: capture `pnpm install` once into the global snapshot upper, then fork a run
// That sees the full node_modules WITHOUT reinstalling (offline, no network) and whose own writes vanish,
// Leaving the source corpus untouched. Heavy + networked during capture, so it self-gates exactly like the
// Os-backend install acceptance. The snapshot cache is redirected under $HOME (not os.tmpdir) because the
// Sandbox masks /tmp with --tmpfs, which would hide a /tmp overlay layer from the command inside.
describe.skipIf(!isSandboxInstallSupported)("createSnapshot - warm capture then fork (acceptance)", () => {
  let corpus = "";
  let cacheHome = "";

  beforeAll(() => {
    corpus = createWorkspaceCorpus(findRepoRoot());
    const cache = join(homedir(), ".cache");
    mkdirSync(cache, { recursive: true });
    cacheHome = mkdtempSync(join(cache, VIRRUN_TEMP_DIR_PREFIX));
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterAll(() => {
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    if (corpus) rmSync(corpus, { force: true, recursive: true });
    if (cacheHome) rmSync(cacheHome, { force: true, recursive: true });
  });

  test("captures the install once, then a fork reuses node_modules offline and the source stays clean", async () => {
    expect.hasAssertions();

    const backend = createOsBackend();
    const sharedPackageStoreOptions = createSharedPackageStoreOptions(corpus);
    const corepackHome = join(getRepoCacheDirectory(corpus), VIRRUN_COREPACK_STORE_DIRECTORY_NAME);
    mkdirSync(corepackHome, { recursive: true });
    const installCommand = process.platform === "win32" ? "corepack pnpm install" : "pnpm install";
    // Capture: a real, networked install whose writes persist into the global snapshot upper.
    const location = await createSnapshot(backend, `${installCommand} --frozen-lockfile`, {
      ...sharedPackageStoreOptions,
      bindDirs: [...(sharedPackageStoreOptions.bindDirs ?? []), corepackHome],
      cwd: corpus,
      env: { ...sharedPackageStoreOptions.env, [COREPACK_HOME_KEY]: corepackHome },
      isNetworkEnabled: true,
      stdio: "pipe",
    });

    expect(location.exists).toBe(true);
    // The install wrote into the snapshot, not the source corpus on disk.
    expect(existsSync(join(corpus, "node_modules"))).toBe(false);

    // Fork: stack the frozen snapshot read-only over the source, offline and with no shared store. The run
    // Sees the full dependency closure (no reinstall) and a native binary (esbuild) executes; its own write
    // Vanishes in tmpfs.
    const forkCommand = [
      "test \"$(find . -path '*/node_modules/*' -type f | wc -l)\" -gt 100000",
      "ESBUILD=$(find node_modules/.pnpm -path '*/bin/esbuild' -type f | head -1)",
      `"$ESBUILD" --version`,
      "echo scratch > fork-only.txt",
      "echo FORK_OK",
    ].join(" && ");
    const { exitCode, stdout } = await backend.exec(forkCommand, {
      cwd: corpus,
      overlayLayers: { lowerDirs: [location.upperDir] },
      stdio: "pipe",
    });

    expect(exitCode).toBe(0);
    expect(stdout).toContain("FORK_OK");
    expect(stdout).toMatch(/\d+\.\d+\.\d+/u);
    expect(existsSync(join(corpus, "fork-only.txt"))).toBe(false);
  }, 300_000);
});
