import { runPrecheck } from "#src/services/precheck/runPrecheck";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:precheck [--fix]` — the formatter, the barrel check, after a manifest change the dependency graph check,
// Each derived ledger's rows against the tree, and the ledger trailers of the commits ahead of ai/queue, over what the
// Checkout changed against ai/queue, run before a push (the `running-checks` skill). `--fix` rewrites a stale barrel or
// Graph with the generator that writes it
await runCommand(
  defineCommand({
    args: {
      fix: {
        default: false,
        description: "Rewrite each stale barrel and a stale dependency graph with the generator that writes it",
        type: "boolean",
      },
    },
    meta: {
      description:
        "Check the formatting of the files changed against ai/queue, each changed package's barrel, after a manifest change dependency-graph.svg, each derived ledger's rows against the tree, and each ledger trailer of the commits ahead of ai/queue against the row it names; prints each problem, or ok; exits 1 on a problem",
      name: "ai:precheck",
    },
    run: async ({ args }) => {
      const report = await runPrecheck(args.fix);
      for (const path of report.regenerated) console.info(`regenerated ${path}`);
      for (const finding of report.findings) console.info(finding);
      if (report.findings.length === 0 && report.regenerated.length === 0) console.info("ok");
      if (report.findings.length > 0) process.exitCode = 1;
    },
  }),
);
