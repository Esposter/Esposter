import { formatPaths } from "#src/services/format/formatPaths";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:format [paths...]` — formats the files in place with the repository's formatter, from any checkout, the files
// Changed against ai/queue when none is named (the `running-checks` skill, "Checks run once, before the commit")
await runCommand(
  defineCommand({
    meta: {
      description:
        "Format the given files in place with the repository's formatter, or the files changed against ai/queue; prints the count it rewrote, or clean",
      name: "ai:format",
    },
    run: ({ args }) => {
      const rewrittenCount = formatPaths(args._.map(String));
      console.info(rewrittenCount === 0 ? "clean" : `formatted ${rewrittenCount} files`);
    },
  }),
);
