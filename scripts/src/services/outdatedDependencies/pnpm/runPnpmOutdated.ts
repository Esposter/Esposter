import type { PnpmOutdatedRun } from "#src/models/outdatedDependencies/PnpmOutdatedRun";

import { PNPM_OUTDATED_COMMAND, PNPM_OUTDATED_TIMEOUT_MS } from "#src/services/outdatedDependencies/pnpm/constants";
import { spawn } from "node:child_process";

export const runPnpmOutdated = (root: string): Promise<PnpmOutdatedRun> =>
  new Promise((resolvePromise) => {
    const command = process.platform === "win32" ? "cmd.exe" : "pnpm";
    const args =
      process.platform === "win32"
        ? ["/d", "/s", "/c", "pnpm", "outdated", "-r", "--format", "json"]
        : ["outdated", "-r", "--format", "json"];
    const child = spawn(command, args, { cwd: root });
    let stdout = "";
    let stderr = "";
    let isSettled = false;
    const settle = (result: PnpmOutdatedRun) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeout);
      resolvePromise(result);
    };
    const timeout = setTimeout(() => {
      child.kill();
      settle({
        error: `${PNPM_OUTDATED_COMMAND} timed out after ${PNPM_OUTDATED_TIMEOUT_MS.toString()}ms`,
        status: null,
        stderr,
        stdout,
      });
    }, PNPM_OUTDATED_TIMEOUT_MS);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      settle({ error: error.message, status: null, stderr, stdout });
    });
    child.on("close", (status) => {
      settle({ status, stderr, stdout });
    });
  });
