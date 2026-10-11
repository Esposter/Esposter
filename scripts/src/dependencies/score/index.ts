import { printDependencyScores } from "#src/services/dependencies/score/printDependencyScores";
import { readDependencyScores } from "#src/services/dependencies/score/readDependencyScores";
import { createColor } from "#src/services/outdatedDependencies/print/createColor";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

await runCommand(
  defineCommand({
    meta: {
      description:
        "Score every catalog entry out of 100 for how sensibly it could be absorbed into our own code, and list the ledger verdicts the score disagrees with",
      name: "ai:dependencies:score",
    },
    run: async () => {
      printDependencyScores(await readDependencyScores(), createColor(!process.env.NO_COLOR));
    },
  }),
);
