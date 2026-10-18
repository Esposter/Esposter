import { APP_DIRECTORY, CLIENT_BUNDLE_REPORT_PATH } from "#src/services/dependencies/score/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { spawnPnpm } from "#src/services/shared/spawnPnpm";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { resolve } from "node:path";

// Builds the app's client bundle with `nuxt analyze`, naming the raw-data report the bundle column reads, which the app's
// Build configuration writes in place of the treemap. Its output goes to the terminal, and a failed build stops the score
// Rather than reading the report of an earlier build
export const runAnalyze = (): void => {
  const appDirectory = resolve(REPOSITORY_ROOT, APP_DIRECTORY);
  const { status } = spawnPnpm(["exec", "nuxt", "analyze", "--no-serve"], {
    cwd: appDirectory,
    env: { ...process.env, CLIENT_BUNDLE_REPORT_PATH },
    stdio: "inherit",
  });
  if (status !== 0) throw new InvalidOperationError(Operation.Read, appDirectory, `nuxt analyze exited ${status}`);
};
