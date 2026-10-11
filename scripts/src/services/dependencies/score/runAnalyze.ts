import { APP_DIRECTORY } from "#src/services/dependencies/score/constants";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { resolve } from "node:path";

// Builds the app's client bundle with `nuxt analyze`, which writes the report the bundle column reads. Its output goes
// To the terminal, and a failed build stops the score rather than reading the report of an earlier build
export const runAnalyze = (): void => {
  const appDirectory = resolve(REPOSITORY_ROOT, APP_DIRECTORY);
  const { status } = spawnPnpm(["exec", "nuxt", "analyze", "--no-serve"], { cwd: appDirectory, stdio: "inherit" });
  if (status !== 0) throw new InvalidOperationError(Operation.Read, appDirectory, `nuxt analyze exited ${status}`);
};
