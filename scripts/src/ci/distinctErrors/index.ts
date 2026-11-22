import { getDistinctErrors } from "#src/services/ci/distinctErrors/getDistinctErrors";
import { runCommand } from "#src/services/timing/runCommand";
import { execFileSync } from "@esposter/shared-node/child-process";
import { defineCommand } from "citty";

await runCommand(
  defineCommand({
    args: { run: { description: "The failed run's id, from gh run list", required: true, type: "positional" } },
    meta: {
      description: "Print the distinct errors of one failed CI run, most frequent first",
      name: "ai:ci:distinct-errors",
    },
    run: ({ args }) => {
      const log = execFileSync("gh", ["run", "view", args.run, "--log-failed"], {
        encoding: "utf8",
        maxBuffer: 256 * 1024 * 1024,
      });
      for (const { count, error } of getDistinctErrors(log)) console.info(`${count} ${error}`);
    },
  }),
);
