import { createNativeBackend } from "@/services/exec/createNativeBackend";
import { createVfsBackend } from "@/services/exec/createVfsBackend";
import { describe, expect, test } from "vitest";
// The correctness gate for the vfs backend: every command must produce the identical observable
// Result (exit code + stdout + stderr) whether run natively or through vfs. The in-process path is
// Where vfs can diverge, so it carries the corpus; the fall-through cases prove routing a command vfs
// Cannot handle to native does not alter the result. See features/sandbox-runtime/specs/correctness.md.
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
});
