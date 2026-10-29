import { runPrecheck } from "#src/services/precheck/runPrecheck";
import { runCommand } from "#src/services/timing/runCommand";
import { defineCommand } from "citty";

// `pnpm ai:precheck [--fix]` — the formatter and the barrel check over what the checkout changed against ai/queue, run
// Before a push (the `running-checks` skill). `--fix` rewrites a stale barrel with the generator the build runs
await runCommand(
  defineCommand({
    args: {
      fix: {
        default: false,
        description: "Rewrite each stale barrel with the generator the build runs",
        type: "boolean",
      },
    },
    meta: {
      description:
        "Check the formatting of the files changed against ai/queue and each changed package's barrel; prints each problem, or ok; exits 1 on a problem, 3 with no built configuration",
      name: "ai:precheck",
    },
    run: ({ args }) => {
      const report = runPrecheck(args.fix);
      if (report.distributionMissing) {
        console.info("packages/configuration/dist is missing from the main checkout: vp run build:configuration there");
        process.exitCode = 3;
        return;
      }
      for (const path of report.regenerated) console.info(`regenerated ${path}`);
      for (const finding of report.findings) console.info(finding);
      if (report.findings.length === 0 && report.regenerated.length === 0) console.info("ok");
      if (report.findings.length > 0) process.exitCode = 1;
    },
  }),
);
