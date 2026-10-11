import { TYPE_BENCH_GLOB } from "#src/services/benchTypes/constants";
import { getTypeBenchResultPath } from "#src/services/benchTypes/getTypeBenchResultPath";
import { checkIsTypeBenchDrifted } from "#src/services/benchTypes/checkIsTypeBenchDrifted";
import { renderTypeBench } from "#src/services/benchTypes/renderTypeBench";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { runCommand } from "#src/services/timing/runCommand";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

// `pnpm bench:types` — every `*.typebench.ts` measured by the repo's own compiler, failing on a count that moved from its
// Committed `*.typebench.md`. `-u` rewrites the results, the way a snapshot is updated.
await runCommand(
  defineCommand({
    args: {
      update: {
        alias: "u",
        default: false,
        description: "Rewrite each committed *.typebench.md instead of failing on a count that moved",
        type: "boolean",
      },
    },
    meta: {
      description:
        "Measure each type bench's case in compiler Types and Instantiations, checked against its committed result",
      name: "bench:types",
    },
    run: ({ args }) => {
      const sourcePaths = readSweepFilePaths(TYPE_BENCH_GLOB);
      if (args.update) {
        for (const sourcePath of sourcePaths)
          writeFileSync(resolve(REPOSITORY_ROOT, getTypeBenchResultPath(sourcePath)), renderTypeBench(sourcePath));

        return;
      }

      const driftedPaths = sourcePaths.filter((sourcePath) => checkIsTypeBenchDrifted(sourcePath));
      if (driftedPaths.length > 0)
        throw new InvalidOperationError(
          Operation.Read,
          "bench:types",
          `drifted from their committed results (run pnpm bench:types -u): ${driftedPaths.join(", ")}`,
        );
    },
  }),
);
