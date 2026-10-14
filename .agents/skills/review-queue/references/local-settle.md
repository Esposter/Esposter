# Local settle

Read when a session is asked to settle the open `review` issues itself, rather than leaving them to the review's settle job or `pnpm ai:review:settle`, which launch separate `claude -p` sessions.

This is the same job run from the session: the main session decides every verdict, and a haiku subagent makes the edits. The rules a settled finding must meet, and the outcomes they allow, are in `apps/web/content/docs/infra/review.md` under "### The settle job". The session checks each commit must pass are the `REVIEW_SESSION_CHECKS` list in the same page, under "### The fix job". Read them there; this page does not restate them.

## Steps

1. List the open issues with `gh issue list --label review --state open`, and read each body. Each finding names a file, a summary and a trigger. Work every finding; none is skipped silently.
2. If an issue's `Run:` line names a run whose review or fix job has not completed, leave that issue open, and name it in the report. A fixer may still be on it.
3. For each issue, the main session decides a verdict for every finding before any edit. Each verdict is one `review.md` allows, with the reason it requires. A `recorded` reason also names, by repo path, the proposal or roadmap page where the decision is written. A finding without a verdict keeps its issue open.

4. For each issue, spawn one subagent with `model: "haiku"`. Never a fork, and never opus or sonnet. Its prompt is its whole world, so give it: the issue number; each finding to fix, verbatim (file, line, summary, trigger); the verdict already decided for each finding; the worktree path; and the done-definition. The done-definition is that every `fixed` and `recorded` finding has its edit committed and landed, its touched tests and checks pass, and it reports an outcome table. The subagent never decides a verdict and never comments on or closes the issue.
5. Give each issue its own worktree, created from the main checkout: `git worktree add -b settle-<issue number> .agents/worktrees/settle-<issue number> origin/ai/queue`. Once its commits have landed, remove it with `bash .agents/skills/throughput/scripts/remove-worktree.sh <full path>`. A relative name fails.
6. Commit by pathspec only: `git commit -m "<type>(<scope>): <what changed>" -- <paths>`. Never `git add -A`, `git stash`, `--amend`, `reset` or a force-push. Each commit ends with the trailer line `Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>`.
7. Before each commit, run the tests of the files it touched, with `pnpm -C <package> test <paths> --run`, and every check the session-check list names for those files. Run long checks in the background. A fix that fails its check is not committed.
8. Land each issue's commits with `for attempt in 1 2 3 4; do git pull --rebase origin ai/queue || break; git push origin HEAD:ai/queue && break; done`. A rebase conflict stops the loop, and it is settled per `.agents/skills/review-queue/references/pull-conflicts.md`. Only a rejected push retries.
9. Close each issue once every finding has a verdict and its commits have landed. Post one comment with a markdown table of each finding's file, verdict and reason, using `gh issue comment <issue number> --body-file <file>`, then run `gh issue close <issue number>`. No commit carries `Closes #<number>`.
10. The main session never pushes `main`. `main` moves only through the review's fast-forward.

The issue's label belongs to the review. This procedure closes the issues a session settles here, and it does not relabel any. Issues the session leaves open are the settle job's on the next push, as `.agents/skills/review-queue/SKILL.md` ("Review issues") says.
