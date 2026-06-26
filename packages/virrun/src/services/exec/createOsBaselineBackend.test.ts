import type { ExecBackend } from "@/models/exec/ExecBackend";

import { createNativeBackend } from "@/services/exec/createNativeBackend";
import { readWslPath } from "@/services/exec/readWslPath";
import { toExitCode } from "@/services/exec/toExitCode";
import { spawn } from "node:child_process";
import { describe } from "vitest";

export const createOsBaselineBackend = (): ExecBackend => {
  if (process.platform !== "win32") return createNativeBackend();
  return {
    exec: (command, options) =>
      new Promise((resolve, reject) => {
        const cwd = readWslPath(options.cwd === "" ? process.cwd() : options.cwd);
        const commandArgs = Array.isArray(command)
          ? ["sh", "-c", `cd "$1" && exec "$@"`, "virrun-baseline", cwd, ...command]
          : ["sh", "-c", `cd "$1" && ${command}`, "virrun-baseline", cwd];
        const child = spawn("wsl.exe", ["--exec", ...commandArgs], { stdio: options.stdio });
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

describe.todo("createOsBaselineBackend");
