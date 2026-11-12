import { TYPE_BENCH_GLOB } from "#src/services/benchTypes/constants";
import { getTypeBenchResultPath } from "#src/services/benchTypes/getTypeBenchResultPath";
import { renderTypeBench } from "#src/services/benchTypes/renderTypeBench";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// `pnpm bench:types` — every `*.typebench.ts` measured by the repo's own compiler, its counts written to the
// `*.typebench.md` beside it, so what a type change did to them is the diff.
await runCommand(
  defineCommand({
    meta: {
      description: "Measure each type bench's cases in compiler Types and Instantiations and write the results",
      name: "bench:types",
    },
    run: async () => {
      await Promise.all(
        readSweepFilePaths(TYPE_BENCH_GLOB).map(async (sourcePath) => {
          writeFileSync(
            resolve(REPOSITORY_ROOT, getTypeBenchResultPath(sourcePath)),
            await renderTypeBench(sourcePath),
          );
        }),
      );
    },
  }),
);
