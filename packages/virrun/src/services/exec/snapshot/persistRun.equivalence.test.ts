import { createOsExecOptions } from "#src/services/exec/os/createOsExecOptions";
import { persistRun } from "#src/services/exec/snapshot/persistRun";
import { ACCEPTANCE_TIMEOUT_MINUTES, PACKAGES_DIRECTORY } from "#src/services/exec/test/constants.test";
import { setupWarmSnapshotSuite } from "#src/services/exec/test/setupWarmSnapshotSuite.test";
import { NODE_MODULES_DIRECTORY } from "#src/services/exec/util/constants";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { MINUTE, takeOne } from "@esposter/shared";
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// Correctness layer 4 write-back equivalence (specs/write-back.md): a persist run leaves the host disk exactly as
// The same command run natively would. One overlay-entry kind per case; one warm snapshot reused across cases.
// Each case boots a sandbox and installs, so the suite costs minutes of wall clock — too slow for the default
// Suite. The body is kept intact; drop the `.todo` to run it when the write-back or flush path changes.
describe.todo("persistRun - flushes produced files but never node_modules (write-back equivalence)", () => {
  // Stands in for any path the sandbox's source view lacks — on win32 a mirror exclude, e.g. a linked worktree root.
  const MASKED_PATH = "b/c";

  const { getBackend, getCorpus } = setupWarmSnapshotSuite();
  const acceptanceTimeoutMs = ACCEPTANCE_TIMEOUT_MINUTES * MINUTE;
  let corpus = "";
  // A real package directory in the corpus (e.g. `packages/virrun`); its per-package node_modules lands in the
  // Snapshot lower, so it is the fixture for the "source under a shared snapshot-lower parent" case.
  let packageDirectory = "";

  beforeAll(() => {
    // Runs after the shared warm-snapshot fixture's beforeAll, so the corpus already exists.
    corpus = getCorpus();
    packageDirectory = `${PACKAGES_DIRECTORY}/${takeOne(readdirSync(join(corpus, PACKAGES_DIRECTORY)), 0)}`;
  });

  afterEach(() => {
    // Reset the host paths each case may flush so a prior flush never leaks into the next (one filename, reused).
    if (corpus) rmSync(join(corpus, TEST_FILENAME), { force: true, recursive: true });
    if (corpus) rmSync(join(corpus, packageDirectory, TEST_FILENAME), { force: true, recursive: true });
    if (corpus) rmSync(join(corpus, MASKED_PATH), { force: true, recursive: true });
  });

  test("a new top-level file reaches the host; node_modules and writes into it do not", async () => {
    expect.hasAssertions();

    const command = [
      `test -d ${NODE_MODULES_DIRECTORY}`,
      `printf "" > ${NODE_MODULES_DIRECTORY}/${TEST_FILENAME}`,
      `printf "" > ${TEST_FILENAME}`,
    ].join(" && ");
    const result = await persistRun(getBackend(), command, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(0);
    expect(readFileSync(join(corpus, TEST_FILENAME), "utf8")).toBe("");
    expect(existsSync(join(corpus, NODE_MODULES_DIRECTORY))).toBe(false);
  }, acceptanceTimeoutMs);

  test("an in-place edit of an existing source file is flushed (the oxfmt / eslint --fix shape)", async () => {
    expect.hasAssertions();

    writeFileSync(join(corpus, TEST_FILENAME), "");
    const result = await persistRun(getBackend(), `printf " " > ${TEST_FILENAME}`, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(0);
    expect(readFileSync(join(corpus, TEST_FILENAME), "utf8")).toBe(" ");
  }, acceptanceTimeoutMs);

  test("a newly created nested file under a new directory is flushed (the ctix barrel / db:gen migration shape)", async () => {
    expect.hasAssertions();

    // The flush must materialise the directory chain, not just the leaf.
    const result = await persistRun(
      getBackend(),
      `mkdir ${TEST_FILENAME} && printf "" > ${TEST_FILENAME}/${TEST_FILENAME}`,
      createOsExecOptions(corpus, "pipe"),
    );

    expect(result.exitCode).toBe(0);
    expect(readFileSync(join(corpus, TEST_FILENAME, TEST_FILENAME), "utf8")).toBe("");
  }, acceptanceTimeoutMs);

  test("a deleted source file is removed from the host (whiteout)", async () => {
    expect.hasAssertions();

    writeFileSync(join(corpus, TEST_FILENAME), "");
    const result = await persistRun(getBackend(), `rm ${TEST_FILENAME}`, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(corpus, TEST_FILENAME))).toBe(false);
  }, acceptanceTimeoutMs);

  test("a source file under a package dir the snapshot lower also materialises is flushed (the lint:fix shape)", async () => {
    expect.hasAssertions();

    // An edit beneath a `packages/<pkg>` parent the snapshot lower also materialises (per-package node_modules) must
    // Reach the host — it must not be masked as a dependency write the way an ancestor-walk over lower paths did.
    const sourcePath = `${packageDirectory}/${TEST_FILENAME}`;
    const result = await persistRun(getBackend(), `printf " " > ${sourcePath}`, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(0);
    expect(readFileSync(join(corpus, packageDirectory, TEST_FILENAME), "utf8")).toBe(" ");
  }, acceptanceTimeoutMs);

  test("a write under a masked path never reaches the host (the stale-mirror ghost shape)", async () => {
    expect.hasAssertions();

    // On win32 the sandbox reads a mirror the excludes were filtered out of, so nothing under one of them can be a
    // Host file the command edited — only stale mirror content a tool happened to rewrite. Flushing it recreated
    // `.agents/worktrees` trees on a host that had deleted them, with the old files the mirror still held.
    const result = await persistRun(
      getBackend(),
      `mkdir -p ${MASKED_PATH}/${TEST_FILENAME} && printf " " > ${MASKED_PATH}/${TEST_FILENAME}/${TEST_FILENAME} && printf " " > ${TEST_FILENAME}`,
      createOsExecOptions(corpus, "pipe"),
      [],
      [MASKED_PATH],
    );

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(corpus, MASKED_PATH))).toBe(false);
    // The same run's unmasked write still lands — masking is per-path, never a blanket drop of the flush.
    expect(readFileSync(join(corpus, TEST_FILENAME), "utf8")).toBe(" ");
  }, acceptanceTimeoutMs);

  test("a non-zero exit still flushes the files it produced (native leaves partial output; the eslint --fix remaining-errors shape)", async () => {
    expect.hasAssertions();

    // Native-equivalence taken literally: a mutation tool that exits non-zero (eslint --fix / oxfmt with unfixable
    // Errors left, a build that half-writes) still wrote real files, so persist reconciles them onto the host too.
    const result = await persistRun(getBackend(), `printf " " > ${TEST_FILENAME} && exit 1`, createOsExecOptions(corpus, "pipe"));

    expect(result.exitCode).toBe(1);
    expect(readFileSync(join(corpus, TEST_FILENAME), "utf8")).toBe(" ");
  }, acceptanceTimeoutMs);
});
