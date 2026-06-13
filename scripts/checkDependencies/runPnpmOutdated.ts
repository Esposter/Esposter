import { spawn } from "node:child_process";

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
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      resolvePromise({ error: error.message, status: null, stderr, stdout });
    });
    child.on("close", (status) => {
      resolvePromise({ status, stderr, stdout });
    });
  });
