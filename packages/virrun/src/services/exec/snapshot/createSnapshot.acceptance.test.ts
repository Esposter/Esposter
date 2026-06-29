import { dayjs } from "@/services/dayjs.test";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import { isSandboxInstallSupported } from "@/services/exec/test/isSandboxInstallSupported.test";
import { VIRRUN_CACHE_HOME_KEY, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

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
    // Drop the captured snapshot first, while the cache override is still active and the corpus lockfile (which
    // Keys the snapshot) still exists.
    if (corpus) removeSnapshotDirectory(resolveSnapshotLocation(corpus).dir);
    delete process.env[VIRRUN_CACHE_HOME_KEY];
    if (corpus) rmSync(corpus, { force: true, recursive: true });
    if (cacheHome) rmSync(cacheHome, { force: true, recursive: true });
  });

  test("captures the install once, then a fork reuses node_modules offline and the source stays clean", async () => {
    expect.hasAssertions();

    const backend = createOsBackend();
    // Capture: a real, networked install whose writes persist into the global snapshot upper. Same install
    // Options createVirrun provisions the snapshot with — store, corepack home, network, login PATH.
    const { location } = await createSnapshot(backend, resolveSetupCommand(), createOsInstallOptions(corpus, "pipe"));

    expect(location.exists).toBe(true);
    // The install wrote into the snapshot, not the source corpus on disk.
    expect(existsSync(join(corpus, "node_modules"))).toBe(false);

    // Fork: stack the frozen snapshot read-only over the source, offline and with no shared store. The run
    // Sees the full dependency closure (no reinstall) and a native binary (esbuild) executes; its own write
    // Vanishes in tmpfs.
    const forkCommand = [
      "test -d node_modules/.pnpm",
      "ESBUILD=$(find node_modules/.pnpm -path '*/bin/esbuild' -type f | head -1)",
      "test -n \"$ESBUILD\"",
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
    // The capture step is a real, networked, frozen-lockfile install of the whole workspace corpus on a cold
    // Store; on a slow host that alone can exceed the smaller default caps, so allow up to 10 minutes.
  }, dayjs.duration(10, "minutes").asMilliseconds());
});
