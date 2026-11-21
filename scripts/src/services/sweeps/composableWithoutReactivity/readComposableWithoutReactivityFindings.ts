import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { checkHasReactiveCall } from "#src/services/sweeps/composableWithoutReactivity/checkHasReactiveCall";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every composable source in the app with no reactive call, lifecycle hook or composable call in it, one path each.
// Its tests and benches are not composables, so they are left out by name rather than by the directory.
export const readComposableWithoutReactivityFindings = (): string[] =>
  readSweepFilePaths("apps/web/app/composables")
    .filter((path) => path.endsWith(".ts") && !path.includes(".test.") && !path.includes(".bench."))
    .filter((path) => !checkHasReactiveCall(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")));
