import { assertDifferential } from "@/services/exec/differential/assertDifferential.test";
import { NODE_DIFFERENTIAL_CORPUS } from "@/services/exec/differential/differentialCorpus.test";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { createVfsBackend } from "@/services/exec/vfs/createVfsBackend";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

// The correctness gate for the vfs backend: every command must produce the identical observable result whether
// Run natively or through vfs. The in-process path is where vfs can diverge, so it carries the corpus.
describe(createVfsBackend, () => {
  const native = createNativeBackend();
  const vfs = createVfsBackend();
  const temporaryDirectories = createTemporaryDirectoryTracker();

  afterEach(() => {
    temporaryDirectories.cleanup();
  });

  test.each(NODE_DIFFERENTIAL_CORPUS)("matches the native backend for $name", async ({ command, rules }) => {
    expect.hasAssertions();

    await assertDifferential(vfs, native, command, rules);
  });

  // A `node <file>` that requires a second module with no virtual shadow, so both reads fall through to real disk
  // — the result must still match native, proving the overlay fall-through path.
  test("matches the native backend for a multi-file file run", async () => {
    expect.hasAssertions();

    const dir = temporaryDirectories.create();
    mkdirSync(join(dir, TEST_FILENAME));
    writeFileSync(join(dir, TEST_FILENAME, `${TEST_FILENAME}.cjs`), "module.exports = ' '");
    writeFileSync(
      join(dir, `${TEST_FILENAME}.cjs`),
      `process.stdout.write(require('./${TEST_FILENAME}/${TEST_FILENAME}.cjs'))`,
    );
    const command = `node ${TEST_FILENAME}.cjs`;

    const nativeResult = await native.exec(command, { cwd: dir, stdio: "pipe" });
    const vfsResult = await vfs.exec(command, { cwd: dir, stdio: "pipe" });

    expect(vfsResult).toStrictEqual({ exitCode: 0, stderr: "", stdout: " " });
    expect(vfsResult).toStrictEqual(nativeResult);
  });
});
