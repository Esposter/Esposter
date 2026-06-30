import { dayjs } from "@/services/dayjs.test";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createOsExecOptions } from "@/services/exec/os/createOsExecOptions";
import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { persistRun } from "@/services/exec/snapshot/persistRun";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { ACCEPTANCE_TIMEOUT_MINUTES, NODE_MODULES_DIRECTORY } from "@/services/exec/test/constants.test";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import { isSandboxInstallSupported } from "@/services/exec/test/isSandboxInstallSupported.test";
import { VIRRUN_CACHE_HOME_KEY, VIRRUN_TEMP_DIR_PREFIX } from "@/services/exec/util/constants";
import { HOME_CACHE_DIRECTORY_NAME, TEST_FILENAME } from "@/services/exec/util/constants.test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

// Correctness layer 5 — write-back equivalence (features/virrun/specs/write-back.md, specs/correctness.md). A
// Persist run must leave the host disk exactly as the same command run natively would: every shape the real
// Mutating siblings (oxfmt, eslint --fix, ctix export:gen, drizzle db:gen) produce in the overlay upper has to
// Reconcile onto the host, while node_modules (the snapshot lower) is never leaked. Rather than driving each tool
// Through its own config — which the manifest-only corpus can't resolve — this exercises the flush MECHANISM every
// Tool relies on, one overlay-entry kind per case: a new top-level file, an in-place edit of an existing source
// File (the oxfmt/eslint --fix shape), a newly created nested file under a new directory (the ctix-barrel /
// Db:gen-migration shape), a whiteout delete, the node_modules drop, and the all-or-nothing rollback on a non-zero
// Exit. One warm snapshot is captured in beforeAll and reused; afterEach resets the shared host artifact so a flush
// From one case never colours the next (the canonical TEST_FILENAME is one name reused across cases, so the reset
// Also avoids the file-vs-dir collision between the top-level and nested cases). Heavy + networked (a real
// Install), so it self-gates exactly like the snapshot warm-fork acceptance; the snapshot cache is redirected
// Under $HOME because the sandbox masks /tmp with --tmpfs, which would hide a /tmp overlay layer from the command
// Running inside.
describe.skipIf(!isSandboxInstallSupported)("persistRun - flushes produced files but never node_modules (write-back equivalence)", () => {
  const backend = createOsBackend();
  const acceptanceTimeoutMs = dayjs.duration(ACCEPTANCE_TIMEOUT_MINUTES, "minutes").asMilliseconds();
  let corpus = "";
  let cacheHome = "";
  const previousCacheHome = process.env[VIRRUN_CACHE_HOME_KEY];

  beforeAll(async () => {
    corpus = createWorkspaceCorpus(findRepoRoot());
    const cache = join(homedir(), HOME_CACHE_DIRECTORY_NAME);
    mkdirSync(cache, { recursive: true });
    cacheHome = mkdtempSync(join(cache, VIRRUN_TEMP_DIR_PREFIX));
    process.env[VIRRUN_CACHE_HOME_KEY] = cacheHome;
    // Capture the warm dependency snapshot once; every case below forks a fresh persistable upper over it.
    await createSnapshot(backend, resolveSetupCommand(), createOsInstallOptions(corpus, "pipe"));
  }, acceptanceTimeoutMs);

  afterEach(() => {
    // Reset the one canonical host path between cases so a prior flush never leaks into the next.
    if (corpus) rmSync(join(corpus, TEST_FILENAME), { force: true, recursive: true });
  });

  afterAll(() => {
    if (corpus) removeSnapshotDirectory(resolveSnapshotLocation(corpus).dir);
    if (previousCacheHome === undefined) delete process.env[VIRRUN_CACHE_HOME_KEY];
    else process.env[VIRRUN_CACHE_HOME_KEY] = previousCacheHome;
    if (corpus) rmSync(corpus, { force: true, recursive: true });
    if (cacheHome) rmSync(cacheHome, { force: true, recursive: true });
  });

  test("a new top-level file reaches the host; node_modules and writes into it do not", async () => {
    expect.hasAssertions();

    // node_modules present (snapshot lower); a write into it (a dep-tree write to drop) plus a top-level file (the
    // Produced output to flush).
    const command = [
      `test -d ${NODE_MODULES_DIRECTORY}`,
      `printf "" > ${NODE_MODULES_DIRECTORY}/${TEST_FILENAME}`,
      `printf "" > ${TEST_FILENAME}`,
    ].join(" && ");
    const result = await persistRun(backend, command, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(0);
    expect(readFileSync(join(corpus, TEST_FILENAME), "utf8")).toBe("");
    expect(existsSync(join(corpus, NODE_MODULES_DIRECTORY))).toBe(false);
  }, acceptanceTimeoutMs);

  test("an in-place edit of an existing source file is flushed (the oxfmt / eslint --fix shape)", async () => {
    expect.hasAssertions();

    // Seed a host source file, then rewrite it inside the sandbox — overlayfs copies the lower file up, the flush
    // Reconciles the new content back. Exactly what an auto-formatter / fixer does to a tracked file.
    writeFileSync(join(corpus, TEST_FILENAME), "");
    const result = await persistRun(backend, `printf " " > ${TEST_FILENAME}`, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(0);
    expect(readFileSync(join(corpus, TEST_FILENAME), "utf8")).toBe(" ");
  }, acceptanceTimeoutMs);

  test("a newly created nested file under a new directory is flushed (the ctix barrel / db:gen migration shape)", async () => {
    expect.hasAssertions();

    // A generator writes into a directory that does not exist on the host yet (e.g. a fresh migrations folder or a
    // Nested src/**/index.ts barrel); the flush must materialise the directory chain, not just the leaf.
    const result = await persistRun(
      backend,
      `mkdir ${TEST_FILENAME} && printf "" > ${TEST_FILENAME}/${TEST_FILENAME}`,
      createOsExecOptions(corpus, "pipe"),
    );

    expect(result.exitCode).toBe(0);
    expect(readFileSync(join(corpus, TEST_FILENAME, TEST_FILENAME), "utf8")).toBe("");
  }, acceptanceTimeoutMs);

  test("a deleted source file is removed from the host (whiteout)", async () => {
    expect.hasAssertions();

    // Seed a host file, then delete it inside the sandbox — the upper carries a whiteout, which the flush turns
    // Into a host delete so disk matches a native `rm`.
    writeFileSync(join(corpus, TEST_FILENAME), "");
    const result = await persistRun(backend, `rm ${TEST_FILENAME}`, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(corpus, TEST_FILENAME))).toBe(false);
  }, acceptanceTimeoutMs);

  test("a non-zero exit flushes nothing — all-or-nothing (the failed-command shape)", async () => {
    expect.hasAssertions();

    // A command that writes then fails must leave the host untouched: persist only reconciles on a clean exit, so a
    // Partial write never lands. A formatter that errors mid-run can't leave half-formatted files behind.
    const result = await persistRun(backend, `printf " " > ${TEST_FILENAME} && exit 1`, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(1);
    expect(existsSync(join(corpus, TEST_FILENAME))).toBe(false);
  }, acceptanceTimeoutMs);
});
