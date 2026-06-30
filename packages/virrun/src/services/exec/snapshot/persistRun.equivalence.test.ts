import { dayjs } from "@/services/dayjs.test";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createOsExecOptions } from "@/services/exec/os/createOsExecOptions";
import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { persistRun } from "@/services/exec/snapshot/persistRun";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { ACCEPTANCE_TIMEOUT_MINUTES } from "@/services/exec/test/constants.test";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import { isSandboxInstallSupported } from "@/services/exec/test/isSandboxInstallSupported.test";
import { VIRRUN_CACHE_HOME_KEY, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { HOME_CACHE_DIRECTORY_NAME } from "@/services/exec/util/constants.test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

// Write-back over a warm snapshot: a persist run flushes the command's produced files onto the host yet never leaks
// Node_modules (the snapshot lower) — not the dir, nor a new file written into it. Heavy + networked (a real
// Install), so it self-gates; the snapshot cache goes under $HOME since the sandbox masks /tmp with --tmpfs.
describe.skipIf(!isSandboxInstallSupported)("persistRun - flushes produced files but never node_modules", () => {
  let corpus = "";
  let cacheHome = "";
  const previousCacheHome = process.env[VIRRUN_CACHE_HOME_KEY];

  beforeAll(() => {
    corpus = createWorkspaceCorpus(findRepoRoot());
    const cache = join(homedir(), HOME_CACHE_DIRECTORY_NAME);
    mkdirSync(cache, { recursive: true });
    cacheHome = mkdtempSync(join(cache, VIRRUN_TEMP_DIR_PREFIX));
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
  });

  afterAll(() => {
    if (corpus) removeSnapshotDirectory(resolveSnapshotLocation(corpus).dir);
    if (previousCacheHome === undefined) delete process.env[VIRRUN_CACHE_HOME_KEY];
    else process.env[VIRRUN_CACHE_HOME_KEY] = previousCacheHome;
    if (corpus) rmSync(corpus, { force: true, recursive: true });
    if (cacheHome) rmSync(cacheHome, { force: true, recursive: true });
  });

  test("a top-level write reaches the host; node_modules and writes into it do not", async () => {
    expect.hasAssertions();

    const backend = createOsBackend();
    await createSnapshot(backend, resolveSetupCommand(), createOsInstallOptions(corpus, "pipe"));
    // Node_modules present (snapshot lower); write into it (a dep-tree write to drop) + a top-level file (flushed).
    const command = [
      "test -d node_modules",
      "printf x > node_modules/.virrun-touch",
      "printf persisted > written-by-persist.txt",
    ].join(" && ");
    const result = await persistRun(backend, command, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(0);
    expect(readFileSync(join(corpus, "written-by-persist.txt"), "utf8")).toBe("persisted");
    expect(existsSync(join(corpus, "node_modules"))).toBe(false);
  }, dayjs.duration(ACCEPTANCE_TIMEOUT_MINUTES, "minutes").asMilliseconds());
});
