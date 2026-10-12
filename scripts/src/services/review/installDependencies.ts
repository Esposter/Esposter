import { PNPM_ARGS, PNPM_FILE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";

// The workspace's packages, installed before a fixer runs its checks against them
export const installDependencies = (): void => {
  const { status } = spawnSync(PNPM_FILE, [...PNPM_ARGS, "install"], { cwd: REPOSITORY_ROOT, stdio: "inherit" });
  if (status !== 0) throw new InvalidOperationError(Operation.Create, "pnpm install", `it exited with ${status}`);
};
