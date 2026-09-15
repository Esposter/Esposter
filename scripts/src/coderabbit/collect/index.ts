import { DRY_RUN_WORKTREE_PREFIX, RETRIGGER_DELAY_OUTPUT } from "#src/services/coderabbit/collect/constants";
import { runCycle } from "#src/services/coderabbit/collect/runCycle";
import { writeJobOutput } from "#src/services/coderabbit/collect/writeJobOutput";
import { checkIsGitHubNumber } from "#src/services/coderabbit/shared/checkIsGitHubNumber";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { getResult, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";

// `pnpm ai:coderabbit:collect [pr] [--dry-run] [--force]` — the arguments, the tree and the job output, which the
// Pass cannot own itself
const {
  positionals: [pullRequestArgument],
  values: { "dry-run": isDryRun, force: isForced },
} = parseArgs({
  allowPositionals: true,
  options: { "dry-run": { default: false, type: "boolean" }, force: { default: false, type: "boolean" } },
});
const pullRequest = pullRequestArgument === undefined ? undefined : Number(pullRequestArgument);
if (pullRequest !== undefined && !checkIsGitHubNumber(pullRequest))
  throw new InvalidOperationError(Operation.Read, "coderabbit", "the pull request argument is not a number");

const dirtyPaths = getNonEmptyLines(runGit(["status", "--porcelain", "-uall"]));
if (!isDryRun && dirtyPaths.length > 0)
  throw new InvalidOperationError(
    Operation.Update,
    "coderabbit",
    `the working tree is dirty — the collector owns it:\n${dirtyPaths.join("\n")}`,
  );

// A throwaway worktree for a dry run, this checkout otherwise; both port steps switch to the base they build on
const cwd = isDryRun ? mkdtempSync(join(tmpdir(), DRY_RUN_WORKTREE_PREFIX)) : REPOSITORY_ROOT;
if (isDryRun) {
  runGit(["worktree", "add", "--detach", cwd, "HEAD"]);
  // A finalizer would miss a throw from the middle of the pass, and a surviving worktree trips the next run
  process.on("exit", () => {
    getResult(() => runGit(["worktree", "remove", "--force", cwd])).match(noop, console.error);
  });
}

const { kind, reason, retriggerDelaySeconds, targetSha } = await runCycle({ cwd, isDryRun, isForced, pullRequest });
console.info(`${kind}: ${reason}${targetSha ? ` — ${targetSha}` : ""}`);
if (retriggerDelaySeconds !== undefined && !isDryRun)
  writeJobOutput(RETRIGGER_DELAY_OUTPUT, retriggerDelaySeconds.toString());
