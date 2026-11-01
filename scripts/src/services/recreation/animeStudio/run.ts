import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";

export const run = (command: string, args: string[], cwd?: string): void => {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0)
    throw new InvalidOperationError(Operation.Create, command, `exited with status ${result.status ?? "none"}`);
};
