import type { ExecBackend } from "#src/models/exec/ExecBackend";

import { BackendType } from "#src/models/virrun/BackendType";
import { createNativeBackend } from "#src/services/exec/native/createNativeBackend";
import { checkIsOsBackendSupported } from "#src/services/exec/os/checkIsOsBackendSupported";
import { TEST_FILENAME } from "#src/services/exec/util/constants.test";
import { spawnHidden } from "#src/services/exec/util/spawnHidden";
import { toExitCode } from "#src/services/exec/util/toExitCode";
import { createWslEnvArgs } from "#src/services/exec/wsl/createWslEnvArgs";
import { readWslPath } from "#src/services/exec/wsl/readWslPath";
import { describe, expect, test } from "vitest";

export const createOsBaselineBackend = (): ExecBackend => {
  if (process.platform !== "win32") return createNativeBackend();
  return {
    exec: (command, options) =>
      new Promise((resolve, reject) => {
        const cwd = readWslPath(options.cwd || process.cwd());
        // Branching on `typeof` rather than `Array.isArray`, which cannot narrow a `readonly string[]` away
        const commandArgs =
          typeof command === "string"
            ? ["sh", "-c", `cd "$1" && ${command}`, "virrun-baseline", cwd]
            : ["sh", "-c", `cd "$1" && shift && exec "$@"`, "virrun-baseline", cwd, ...command];
        const child = spawnHidden("wsl.exe", ["--exec", "env", ...createWslEnvArgs(options), ...commandArgs], {
          env: { ...process.env, ...options.env },
          stdio: options.stdio,
        });
        let stdout = "";
        let stderr = "";
        child.stdout?.on("data", (chunk) => {
          stdout += chunk.toString();
        });
        child.stderr?.on("data", (chunk) => {
          stderr += chunk.toString();
        });
        child.on("error", reject);
        child.on("close", (code, signal) => {
          resolve({ exitCode: toExitCode(code, signal), stderr, stdout });
        });
      }),
    name: BackendType.Os,
  };
};

describe(createOsBaselineBackend, () => {
  test.skipIf(process.platform !== "win32" || !checkIsOsBackendSupported())(
    "captures stdout and zero exit code from WSL",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBaselineBackend();
      const { exitCode, stdout } = await exec(`echo ${TEST_FILENAME}`, { cwd: "", stdio: "pipe" });

      expect(exitCode).toBe(0);
      expect(stdout.trim()).toBe(TEST_FILENAME);
    },
  );

  test.skipIf(process.platform !== "win32" || !checkIsOsBackendSupported())(
    "propagates a non-zero exit code from WSL",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBaselineBackend();
      const { exitCode } = await exec(`sh -c 'exit 1'`, { cwd: "", stdio: "pipe" });

      expect(exitCode).toBe(1);
    },
  );

  test.skipIf(process.platform !== "win32" || !checkIsOsBackendSupported())(
    "passes an argv array as discrete arguments in WSL",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBaselineBackend();
      const { stdout } = await exec(["printf", "%s", " "], {
        cwd: "",
        stdio: "pipe",
      });

      expect(stdout).toBe(" ");
    },
  );

  test.skipIf(process.platform !== "win32" || !checkIsOsBackendSupported())(
    "passes environments correctly to WSL",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBaselineBackend();
      const { stdout } = await exec(["sh", "-c", "echo $TEST_VAR"], {
        cwd: "",
        env: {
          TEST_VAR: TEST_FILENAME,
        },
        stdio: "pipe",
      });

      expect(stdout.trim()).toBe(TEST_FILENAME);
    },
  );
});
