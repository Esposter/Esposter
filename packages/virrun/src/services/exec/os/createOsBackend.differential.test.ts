import { assertDifferential } from "@/services/exec/differential/assertDifferential.test";
import { SHELL_DIFFERENTIAL_CORPUS } from "@/services/exec/differential/differentialCorpus.test";
import { createOsBackend } from "@/services/exec/os/createOsBackend";
import { isOsBackendSupported } from "@/services/exec/os/isOsBackendSupported";
import { createTemporaryDirectory } from "@/services/exec/test/createTemporaryDirectory.test";
import { TEST_FILE_NAME } from "@/services/exec/util/constants.test";
import { createOsBaselineBackend } from "@/services/exec/wsl/createOsBaselineBackend.test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

// Compares the observable command result (exit code + stdout + stderr) against native - not host disk
// Side-effects, since the os backend intentionally hides writes from the host. The isolation contract
// Is asserted separately below. See features/virrun/specs/correctness.md.
describe.skipIf(!isOsBackendSupported())(createOsBackend, () => {
  const native = createOsBaselineBackend();

  test.each(SHELL_DIFFERENTIAL_CORPUS)("matches the native backend for $name", async ({ command, rules }) => {
    expect.hasAssertions();

    await assertDifferential(createOsBackend(), native, command, rules);
  });

  test("a write inside the sandbox never touches the host disk", async () => {
    expect.hasAssertions();

    const dir = createTemporaryDirectory();
    const os = createOsBackend();

    const writeResult = await os.exec(`echo x > ${TEST_FILE_NAME}`, { cwd: dir, stdio: "pipe" });

    expect(writeResult.exitCode).toBe(0);
    expect(existsSync(join(dir, TEST_FILE_NAME))).toBe(false);

    // A fresh exec gets a fresh RAM upper, so the previous run's write is gone there too.
    const readResult = await os.exec(`cat ${TEST_FILE_NAME}`, { cwd: dir, stdio: "pipe" });

    expect(readResult.exitCode).not.toBe(0);
  });
});
