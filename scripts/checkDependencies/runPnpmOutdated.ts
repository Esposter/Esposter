import { spawn } from "node:child_process";

const timeoutMs = 120_000;

export const runPnpmOutdated = (
  root: string,
): Promise<{ error?: string; status: null | number; stderr: string; stdout: string }> =>
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
    const settle = (result: { error?: string; status: null | number; stderr: string; stdout: string }) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timeout);
      resolvePromise(result);
    };
    const timeout = setTimeout(() => {
      child.kill();
      settle({ error: `pnpm outdated -r timed out after ${timeoutMs}ms`, status: null, stderr, stdout });
    }, timeoutMs);
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
