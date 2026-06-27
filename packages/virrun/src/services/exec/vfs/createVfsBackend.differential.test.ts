import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { createVfsBackend } from "@/services/exec/vfs/createVfsBackend";
import { mkdtempSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// The correctness gate for the vfs backend: every command must produce the identical observable
// Result (exit code + stdout + stderr) whether run natively or through vfs. The in-process path is
// Where vfs can diverge, so it carries the corpus; the fall-through cases prove routing a command vfs
// Cannot handle to native does not alter the result. See features/virrun/specs/correctness.md.
describe(createVfsBackend, () => {
  const native = createNativeBackend();
  const vfs = createVfsBackend();
  const COMMANDS = [
    `node -e "process.stdout.write(' ')"`,
    `node -e "process.stderr.write(' ')"`,
    `node -e "process.exit(3)"`,
    `node -e "process.stdout.write(require('node:path').sep)"`,
    `node -e ""`,
    `node -e "throw new Error(' ')"`,
    `node -p "1 + 1"`,
    `node --version`,
  ];

  test.each(COMMANDS)("matches the native backend for %j", async (command) => {
    expect.hasAssertions();

    const nativeResult = await native.exec(command, { cwd: "", stdio: "pipe" });
    const vfsResult = await vfs.exec(command, { cwd: "", stdio: "pipe" });

    expect(vfsResult).toStrictEqual(nativeResult);
  });

  // A `node <file>` workload that loads a second module from real disk. vfs runs it in-process under an
  // Overlay mounted at the working dir: neither file has a virtual shadow, so both reads fall through to
  // Real disk - and the result must still match native, proving the overlay fall-through path.
  test("matches the native backend for a multi-file file run", async () => {
    expect.hasAssertions();

    const dir = realpathSync(mkdtempSync(join(tmpdir(), "vfs-diff-")));
    writeFileSync(join(dir, "helper.cjs"), "module.exports = ' '");
    writeFileSync(join(dir, "main.cjs"), "process.stdout.write(require('./helper.cjs'))");
    const command = "node main.cjs";

    const nativeResult = await native.exec(command, { cwd: dir, stdio: "pipe" });
    const vfsResult = await vfs.exec(command, { cwd: dir, stdio: "pipe" });

    expect(vfsResult).toStrictEqual({ exitCode: 0, stderr: "", stdout: " " });
    expect(vfsResult).toStrictEqual(nativeResult);
  });
});
