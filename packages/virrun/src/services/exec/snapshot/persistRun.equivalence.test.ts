import { dayjs } from "@/services/dayjs.test";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { createOsExecOptions } from "@/services/exec/os/createOsExecOptions";
import { persistRun } from "@/services/exec/snapshot/persistRun";
import { ACCEPTANCE_TIMEOUT_MINUTES, PACKAGES_DIRECTORY } from "@/services/exec/test/constants.test";
import { createWorkspaceCorpus } from "@/services/exec/test/createWorkspaceCorpus.test";
import { ensureWarmSnapshot } from "@/services/exec/test/ensureWarmSnapshot.test";
import { findRepoRoot } from "@/services/exec/test/findRepoRoot.test";
import { isSandboxInstallSupported } from "@/services/exec/test/isSandboxInstallSupported.test";
import { resolveAcceptanceCacheHome } from "@/services/exec/test/resolveAcceptanceCacheHome.test";
import { NODE_MODULES_DIRECTORY, VIRRUN_CACHE_HOME_KEY } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { takeOne } from "@esposter/shared";
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

// Correctness layer 4 write-back equivalence (specs/write-back.md): a persist run leaves the host disk exactly as
// The same command run natively would. One overlay-entry kind per case; one warm snapshot reused across cases.
describe.skipIf(!isSandboxInstallSupported)("persistRun - flushes produced files but never node_modules (write-back equivalence)", () => {
  const backend = createOsBackend();
  const acceptanceTimeoutMs = dayjs.duration(ACCEPTANCE_TIMEOUT_MINUTES, "minutes").asMilliseconds();
  let corpus = "";
  // A real package directory in the corpus (e.g. `packages/virrun`); its per-package node_modules lands in the
  // Snapshot lower, so it is the fixture for the "source under a shared snapshot-lower parent" case.
  let packageDirectory = "";
  const previousCacheHome = process.env[VIRRUN_CACHE_HOME_KEY];

  beforeAll(async () => {
    process.env[VIRRUN_CACHE_HOME_KEY] = resolveAcceptanceCacheHome();
    corpus = createWorkspaceCorpus(findRepoRoot());
    packageDirectory = `${PACKAGES_DIRECTORY}/${takeOne(readdirSync(join(corpus, PACKAGES_DIRECTORY)), 0)}`;
    await ensureWarmSnapshot(backend, corpus);
  }, acceptanceTimeoutMs);

  afterEach(() => {
    // Reset the host paths each case may flush so a prior flush never leaks into the next (one filename, reused).
    if (corpus) rmSync(join(corpus, TEST_FILENAME), { force: true, recursive: true });
    if (corpus) rmSync(join(corpus, packageDirectory, TEST_FILENAME), { force: true, recursive: true });
  });

  afterAll(() => {
    // The shared snapshot + cache home are owned by the global teardown; here only the per-file corpus is dropped.
    if (previousCacheHome === undefined) delete process.env[VIRRUN_CACHE_HOME_KEY];
    else process.env[VIRRUN_CACHE_HOME_KEY] = previousCacheHome;
    if (corpus) rmSync(corpus, { force: true, recursive: true });
  });

  test("a new top-level file reaches the host; node_modules and writes into it do not", async () => {
    expect.hasAssertions();

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

    writeFileSync(join(corpus, TEST_FILENAME), "");
    const result = await persistRun(backend, `printf " " > ${TEST_FILENAME}`, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(0);
    expect(readFileSync(join(corpus, TEST_FILENAME), "utf8")).toBe(" ");
  }, acceptanceTimeoutMs);

  test("a newly created nested file under a new directory is flushed (the ctix barrel / db:gen migration shape)", async () => {
    expect.hasAssertions();

    // The flush must materialise the directory chain, not just the leaf.
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

    writeFileSync(join(corpus, TEST_FILENAME), "");
    const result = await persistRun(backend, `rm ${TEST_FILENAME}`, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(corpus, TEST_FILENAME))).toBe(false);
  }, acceptanceTimeoutMs);

  test("a source file under a package dir the snapshot lower also materialises is flushed (the lint:fix shape)", async () => {
    expect.hasAssertions();

    // An edit beneath a `packages/<pkg>` parent the snapshot lower also materialises (per-package node_modules) must
    // Reach the host — it must not be masked as a dependency write the way an ancestor-walk over lower paths did.
    const sourcePath = `${packageDirectory}/${TEST_FILENAME}`;
    const result = await persistRun(backend, `printf " " > ${sourcePath}`, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(0);
    expect(readFileSync(join(corpus, packageDirectory, TEST_FILENAME), "utf8")).toBe(" ");
  }, acceptanceTimeoutMs);

  test("a non-zero exit flushes nothing — all-or-nothing (the failed-command shape)", async () => {
    expect.hasAssertions();

    // Persist only reconciles on a clean exit, so a partial write never lands.
    const result = await persistRun(backend, `printf " " > ${TEST_FILENAME} && exit 1`, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(1);
    expect(existsSync(join(corpus, TEST_FILENAME))).toBe(false);
  }, acceptanceTimeoutMs);
});
