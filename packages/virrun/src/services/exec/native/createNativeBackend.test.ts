import { createNativeBackend } from "#src/services/exec/native/createNativeBackend";
import { createTemporaryDirectoryTracker } from "#src/services/exec/test/createTemporaryDirectoryTracker.test";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { writeFileSync } from "node:fs";
import { delimiter, join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(createNativeBackend, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  const printArgvScript = "process.stdout.write(process.argv.slice(1).join('|'))";

  afterEach(() => {
    cleanup();
  });

  test("captures stdout and a zero exit code", async () => {
    expect.hasAssertions();

    const { exec } = createNativeBackend();
    const { exitCode, stdout } = await exec(`node -e "process.stdout.write('${TEST_FILENAME}')"`, {
      cwd: "",
      stdio: "pipe",
    });

    expect(exitCode).toBe(0);
    expect(stdout).toBe(TEST_FILENAME);
  });

  test("propagates a non-zero exit code", async () => {
    expect.hasAssertions();

    const { exec } = createNativeBackend();
    const { exitCode } = await exec(`node -e "process.exit(1)"`, { cwd: "", stdio: "pipe" });

    expect(exitCode).toBe(1);
  });

  test("passes an argv array as data: a token with spaces is not re-split and a shell operator is not run", async () => {
    expect.hasAssertions();

    const { exec } = createNativeBackend();
    const { stdout } = await exec(["node", "-e", printArgvScript, " ", "a&&echo"], { cwd: "", stdio: "pipe" });

    expect(stdout).toBe(" |a&&echo");
  });

  test.runIf(process.platform === "win32")(
    "runs a .cmd shim from an argv array with its arguments kept as data",
    async () => {
      expect.hasAssertions();

      const cwd = create();
      writeFileSync(join(cwd, `${TEST_FILENAME}.cmd`), `@node -e "${printArgvScript}" %*`);
      // On PATH rather than resolved from cwd, like every real shim — cmd.exe skips cwd under
      // NoDefaultCurrentDirectoryInExePath
      vi.stubEnv("PATH", `${cwd}${delimiter}${process.env.PATH}`);
      const { exec } = createNativeBackend();
      const { exitCode, stdout } = await exec([TEST_FILENAME, " ", "a&&echo"], { cwd, stdio: "pipe" });

      expect(exitCode).toBe(0);
      expect(stdout).toBe(" |a&&echo");
    },
  );
});
