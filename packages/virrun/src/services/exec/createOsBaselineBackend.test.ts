import type { ExecBackend } from "@/models/exec/ExecBackend";

import { createNativeBackend } from "@/services/exec/createNativeBackend";
import { createWslEnvArgs } from "@/services/exec/createWslEnvArgs";
import { isOsBackendSupported } from "@/services/exec/isOsBackendSupported";
import { readWslPath } from "@/services/exec/readWslPath";
import { toExitCode } from "@/services/exec/toExitCode";
import { spawn } from "node:child_process";
import { describe, expect, test } from "vitest";

export const createOsBaselineBackend = (): ExecBackend => {
  if (process.platform !== "win32") return createNativeBackend();
  return {
    exec: (command, options) =>
      new Promise((resolve, reject) => {
        const cwd = readWslPath(options.cwd === "" ? process.cwd() : options.cwd);
        const commandArgs = Array.isArray(command)
          ? ["sh", "-c", `cd "$1" && shift && exec "$@"`, "virrun-baseline", cwd, ...command]
          : ["sh", "-c", `cd "$1" && ${command}`, "virrun-baseline", cwd];
        const child = spawn("wsl.exe", ["--exec", "env", ...createWslEnvArgs(options), ...commandArgs], {
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
    name: "os-baseline",
  };
};

describe(createOsBaselineBackend, () => {
  test.skipIf(process.platform !== "win32" || !isOsBackendSupported())(
    "captures stdout and zero exit code from WSL",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBaselineBackend();
      const { exitCode, stdout } = await exec(`echo ok`, { cwd: "", stdio: "pipe" });

      expect(exitCode).toBe(0);
      expect(stdout.trim()).toBe("ok");
    },
  );

  test.skipIf(process.platform !== "win32" || !isOsBackendSupported())(
    "propagates a non-zero exit code from WSL",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBaselineBackend();
      const { exitCode } = await exec(`sh -c 'exit 3'`, { cwd: "", stdio: "pipe" });

      expect(exitCode).toBe(3);
    },
  );

  test.skipIf(process.platform !== "win32" || !isOsBackendSupported())(
    "passes an argv array as discrete arguments in WSL",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBaselineBackend();
      const { stdout } = await exec(["printf", "%s", "hello world.txt"], {
        cwd: "",
        stdio: "pipe",
      });

      expect(stdout).toBe("hello world.txt");
    },
  );

  test.skipIf(process.platform !== "win32" || !isOsBackendSupported())(
    "passes environments correctly to WSL",
    async () => {
      expect.hasAssertions();

      const { exec } = createOsBaselineBackend();
      const { stdout } = await exec(["sh", "-c", "echo $TEST_VAR"], {
        cwd: "",
        env: {
          TEST_VAR: "hello_env",
        },
        stdio: "pipe",
      });

      expect(stdout.trim()).toBe("hello_env");
    },
  );
});
