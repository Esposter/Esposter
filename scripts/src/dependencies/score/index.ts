import { ScoreSort } from "#src/models/dependencies/score/ScoreSort";
import { printDependencyScores } from "#src/services/dependencies/score/printDependencyScores";
import { printTopBundles } from "#src/services/dependencies/score/printTopBundles";
import { readDependencyScores } from "#src/services/dependencies/score/readDependencyScores";
import { createColor } from "#src/services/outdatedDependencies/print/createColor";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

await runCommand(
  defineCommand({
    args: {
      sort: {
        default: ScoreSort.Score,
        description:
          "Order the rows by the score, or by the gzipped bytes each package adds to the app's client bundle",
        options: Object.values(ScoreSort),
        type: "enum",
      },
    },
    meta: {
      description:
        "Score every catalog entry out of 100 for how sensibly it could be absorbed into our own code, and list the ledger verdicts the score disagrees with",
      name: "ai:dependencies:score",
    },
    run: async ({ args }) => {
      const report = await readDependencyScores(args.sort);
      const color = createColor(!process.env.NO_COLOR);
      printDependencyScores(report, color);
      printTopBundles(report.scores, color);
    },
  }),
);
