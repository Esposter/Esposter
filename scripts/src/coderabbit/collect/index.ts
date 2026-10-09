import type { CycleOutcome } from "#src/models/coderabbit/collect/CycleOutcome";

import { AttemptFailedError } from "#src/models/coderabbit/collect/AttemptFailedError";
import { CycleOutcomeKind } from "#src/models/coderabbit/collect/CycleOutcomeKind";
import { SessionLimitedError } from "#src/models/coderabbit/collect/SessionLimitedError";
import { WindowPullRequestListState } from "#src/models/coderabbit/collect/WindowPullRequestListState";
import {
  ATTEMPT_RETRY_DELAY_SECONDS,
  COLLECTOR_SOURCE_PATH,
  DRY_RUN_WORKTREE_PREFIX,
  OUTAGE_RETRY_DELAY_SECONDS,
  RETRIGGER_BUFFER_MS,
  RETRIGGER_DELAY_OUTPUT,
} from "#src/services/coderabbit/collect/constants";
import { getNewestWindowPullRequest } from "#src/services/coderabbit/collect/getNewestWindowPullRequest";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { postSessionLimited } from "#src/services/coderabbit/collect/postSessionLimited";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readWindowPullRequests } from "#src/services/coderabbit/collect/readWindowPullRequests";
import { runCycle } from "#src/services/coderabbit/collect/runCycle";
import { writeJobOutput } from "#src/services/coderabbit/collect/writeJobOutput";
import { checkIsGitHubNumber } from "#src/services/shared/checkIsGitHubNumber";
import { GITHUB_OUTAGE_REGEX, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult, getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { defineCommand, runMain } from "citty";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// `pnpm ai:coderabbit:collect [pr] [--dry-run]` — the arguments, the tree and the job output, which the
// Pass cannot own itself
await runMain(
  defineCommand({
    args: {
      pullRequest: {
        description:
          "A merged window pull request whose findings are answered when no window is open, in place of the stack's own",
        required: false,
        type: "positional",
      },
      "dry-run": {
        default: false,
        description: "Run the pass in a throwaway worktree and push nothing",
        type: "boolean",
      },
    },
    meta: { description: "Run one pass of the review collector", name: "ai:coderabbit:collect" },
    run: async ({ args }) => {
      const { "dry-run": isDryRun, pullRequest: pullRequestArgument } = args;
      const pullRequest = pullRequestArgument === undefined ? undefined : Number(pullRequestArgument);
      if (pullRequest !== undefined && !checkIsGitHubNumber(pullRequest))
        throw new InvalidOperationError(Operation.Read, "coderabbit", "the pull request argument is not a number");
      // The basis every attempt count names (`getMarker`): the hash of the collector's own source at the ref this run
      // Started from, read before the pass switches the checkout to the trees it builds on
      const collectorSha = runGit(["rev-parse", `HEAD:${COLLECTOR_SOURCE_PATH}`]).trim();

      const dirtyPaths = readDirtyPaths();
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
      } else {
        // The pass switches this checkout to the tree it builds on — develop, main, the fixes branch — and the runner
        // Resolves its local actions from the workspace once more at post time, where a tree lacking one fails the job
        // Red after a pass that succeeded; so the checkout goes back where it was found, by branch when it was on one
        const startRef = getResult(() => runGit(["symbolic-ref", "--short", "--quiet", "HEAD"]).trim()).unwrapOr(
          readHeadSha(),
        );
        // Forced: a pass that failed mid-sequence leaves what it was holding, and a plain checkout refuses over it —
        // Which would strand the runner on a tree its post step reads. Quiet: a window the port built and did not push
        // Is a detached commit this checkout leaves behind, and git's warning about it reads as lost work when the next
        // Run rebuilds it from the same refs.
        process.on("exit", () => {
          getResult(() => runGit(["checkout", "--force", "--quiet", startRef])).match(noop, console.error);
        });
      }

      // A counted attempt that failed, or GitHub answering a server error, ends the run idle and wakes the next
      // One rather than red: the retry is owed and automatic, and red is kept for what only a person can restart
      // (docs: Infra/review-collector). A limit Claude Code hit is marked on the newest release with the instant it
      // Lifts, which every run reads to hold the merge and the port until then, and the run wakes the cycle at that
      // Instant: the sessions that push the queue draw on the same account, so no push may come to wake it
      const { kind, reason, retriggerDelaySeconds, targetSha } = await getResultAsync(() =>
        runCycle({ collectorSha, cwd, isDryRun, pullRequest }),
      ).match(
        (outcome) => outcome,
        (error): CycleOutcome => {
          if (error instanceof AttemptFailedError)
            return {
              kind: CycleOutcomeKind.Idle,
              reason: error.message,
              retriggerDelaySeconds: ATTEMPT_RETRY_DELAY_SECONDS,
            };
          else if (error instanceof SessionLimitedError) {
            const newestWindow = getNewestWindowPullRequest(readWindowPullRequests(WindowPullRequestListState.All));
            if (newestWindow && !isDryRun) postSessionLimited(newestWindow.number, error.limitResetAtMs);
            return {
              kind: CycleOutcomeKind.Idle,
              reason: error.message,
              retriggerDelaySeconds: getRetriggerDelaySeconds(error.limitResetAtMs - Date.now() + RETRIGGER_BUFFER_MS),
            };
          } else if (GITHUB_OUTAGE_REGEX.test(error.message))
            return {
              kind: CycleOutcomeKind.Idle,
              reason: error.message,
              retriggerDelaySeconds: OUTAGE_RETRY_DELAY_SECONDS,
            };
          throw error;
        },
      );
      console.info(`${kind}: ${reason}${targetSha ? ` — ${targetSha}` : ""}`);
      if (retriggerDelaySeconds !== undefined && !isDryRun)
        writeJobOutput(RETRIGGER_DELAY_OUTPUT, retriggerDelaySeconds.toString());
    },
  }),
);
