import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getEnvWithoutPackageBins } from "#src/services/updateNode/getEnvWithoutPackageBins";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";

// Runs the global `vp`, which resolves, pins and installs node, and cleans the versions nothing names any more
export const runVp = (vpArgs: string[]): void => {
  const result = spawnSync("vp", vpArgs, {
    cwd: REPOSITORY_ROOT,
    env: getEnvWithoutPackageBins(process.env),
    stdio: "inherit",
  });
  if (result.status !== 0)
    throw new InvalidOperationError(
      Operation.Update,
      "update:node",
      `\`vp ${vpArgs.join(" ")}\` failed — install the global vp first (https://viteplus.dev/guide/)`,
    );
};
