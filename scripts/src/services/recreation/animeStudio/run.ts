import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";

export const run = (command: string, args: string[], cwd?: string): void => {
  const { error, status } = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (status !== 0)
    throw new InvalidOperationError(
      Operation.Create,
      command,
      error?.message ?? `exited with status ${status ?? "none"}`,
    );
};
