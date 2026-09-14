import { DRY_RUN_WORKTREE_PREFIX, RETRIGGER_DELAY_OUTPUT } from "#src/services/coderabbit/collect/constants";
import { runCycle } from "#src/services/coderabbit/collect/runCycle";
import { writeJobOutput } from "#src/services/coderabbit/collect/writeJobOutput";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { getResult, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";

// `pnpm ai:coderabbit:collect [pr] [--dry-run] [--force]`. Everything the pass cannot own itself lives here: the
// Arguments, the tree it works in, and the job output the runner's second job reads.
const {
  positionals: [pullRequestArgument],
  values: { "dry-run": isDryRun, force: isForced },
} = parseArgs({
  allowPositionals: true,
  options: { "dry-run": { default: false, type: "boolean" }, force: { default: false, type: "boolean" } },
});
const pullRequest = pullRequestArgument === undefined ? undefined : Number(pullRequestArgument);
if (pullRequest !== undefined && (!Number.isSafeInteger(pullRequest) || pullRequest <= 0))
  throw new InvalidOperationError(Operation.Read, "coderabbit", "the pull request argument is not a number");

const dirtyPaths = getNonEmptyLines(runGit(["status", "--porcelain", "-uall"]));
if (!isDryRun && dirtyPaths.length > 0)
  throw new InvalidOperationError(
    Operation.Update,
    "coderabbit",
    `the working tree is dirty — the collector owns it:\n${dirtyPaths.join("\n")}`,
  );

// The tree the run owns — a throwaway worktree for a dry run, this checkout otherwise. Both port steps switch it
// To the base they build on, so what it starts at only has to exist.
const cwd = isDryRun ? mkdtempSync(join(tmpdir(), DRY_RUN_WORKTREE_PREFIX)) : REPOSITORY_ROOT;
if (isDryRun) {
  runGit(["worktree", "add", "--detach", cwd, "HEAD"]);
  // The pass returns rather than exits, so a finalizer would cover the normal end — but not a throw from the
  // Middle of it, and a worktree that survives the process is the one thing the next run trips over.
  process.on("exit", () => {
    getResult(() => runGit(["worktree", "remove", "--force", cwd])).match(noop, console.error);
  });
}

const { kind, reason, retriggerDelaySeconds, targetSha } = await runCycle({ cwd, isDryRun, isForced, pullRequest });
console.info(`${kind}: ${reason}${targetSha ? ` — ${targetSha}` : ""}`);
if (retriggerDelaySeconds !== undefined && !isDryRun)
  writeJobOutput(RETRIGGER_DELAY_OUTPUT, retriggerDelaySeconds.toString());
