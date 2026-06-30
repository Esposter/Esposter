import { assertDifferential } from "@/services/exec/differential/assertDifferential.test";
import { NODE_DIFFERENTIAL_CORPUS } from "@/services/exec/differential/differentialCorpus.test";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { createVfsBackend } from "@/services/exec/vfs/createVfsBackend";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

// The correctness gate for the vfs backend: every command must produce the identical observable
// Result (exit code + stdout + stderr) whether run natively or through vfs. The in-process path is
// Where vfs can diverge, so it carries the corpus; the fall-through cases prove routing a command vfs
// Cannot handle to native does not alter the result. See features/virrun/specs/correctness.md.
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

  // A `node <file>` workload that loads a second module from real disk. vfs runs it in-process under an
  // Overlay mounted at the working dir: neither file has a virtual shadow, so both reads fall through to
  // Real disk - and the result must still match native, proving the overlay fall-through path.
  test("matches the native backend for a multi-file file run", async () => {
    expect.hasAssertions();

    const dir = temporaryDirectories.create();
    // The required dependency lives one directory down so both files reuse the canonical name instead of
    // Inventing distinct ones; main reads it back through a relative require, exercising the overlay fall-through.
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
