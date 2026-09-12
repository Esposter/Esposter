import { spawnSync } from "node:child_process";

// The pushed head runs CI on its own and the interior queue commits were verified by nobody, so the cut gets
// The checks CI would fail it on. Check-only: a repair the collector wrote would be a commit nobody reviewed.
// Tests are left to develop's own CI — a red suite there is one more finding for the next window.
const COMMANDS: string[][] = [
  ["pnpm", "build:packages"],
  ["pnpm", "-r", "--parallel", "run", "typecheck"],
  ["pnpm", "exec", "oxlint", "--format=default", "--disable-nested-config"],
];

export const verifyCandidate = (cwd: string): boolean =>
  COMMANDS.every(([command = "", ...args]) => {
    console.info(`verify: ${command} ${args.join(" ")}`);
    const { status } = spawnSync(command, args, {
      cwd,
      encoding: "utf8",
      shell: process.platform === "win32",
      stdio: "inherit",
    });
    return status === 0;
  });
