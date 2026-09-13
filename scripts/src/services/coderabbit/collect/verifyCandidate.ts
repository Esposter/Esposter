import { spawnSync } from "node:child_process";

// The pushed head runs CI on its own and the interior queue commits were verified by nobody, so the cut gets
// The checks CI would fail it on. Check-only: a repair the collector wrote would be a commit nobody reviewed.
// Tests are left to develop's own CI — a red suite there is one more finding for the next window.
// The two ESLint passes are what the root `lint` script runs after oxlint, minus its `virrun` wrapper: this
// Checkout is already the isolated copy `virrun` exists to make. Oxlint alone let an import-order error through
// To a pushed window, and a pre-push control that is not the check protecting `develop` protects nothing.
const COMMANDS: string[][] = [
  ["pnpm", "build:packages"],
  ["pnpm", "-r", "--parallel", "run", "typecheck"],
  ["pnpm", "exec", "oxlint", "--format=default", "--disable-nested-config"],
  ["pnpm", "exec", "eslint", "."],
  ["pnpm", "-r", "--parallel", "run", "lint"],
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
