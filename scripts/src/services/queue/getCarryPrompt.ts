// The carry step's session, for the one commit a push's replay stops on: the remote queue has moved past the branch,
// So the commit's change meets the collector's work on the same lines. Its resolution follows the rules of the
// Review-queue skill's `pull-conflicts` reference, and it owes no check — the push does not wait on one, and CI names
// Any red to the commit's own owner. A skip or an abort leaves HEAD where it was, so the commit is committed empty
// Instead, and the push reads the carry as done only by the commit it leaves on top of the replay.
export const getCarryPrompt = (conflictSha: string, conflictedPaths: string[]): string =>
  [
    `You are the queue push's carry step. This worktree is mid-\`git cherry-pick\`: the session's commit ${conflictSha} is being replayed onto \`origin/ai/queue\`, which the review collector has rewritten since the session last pushed. The pick stopped at these paths:`,
    "",
    ...conflictedPaths.map((path) => `- ${path}`),
    "",
    `\`HEAD\` is \`origin/ai/queue\` with the session's earlier commits already carried on it, so the side that is not the commit is work the remote already holds. Read \`git show ${conflictSha}\` for what the session changed, and \`git log -p origin/ai/queue -- <path>\` for what the remote changed in each path.`,
    "",
    "Settle every conflict by keeping the substance of both sides: merge the two by hand, keeping every line either side added. Never take one side whole — `git checkout --ours` or `--theirs` drops every change the other side made, conflicting hunk or not. Where one side's design replaces the other's, carry what the replaced side fixed into the new design rather than dropping it, and never drop another agent's line.",
    "",
    "`pnpm-lock.yaml` is never merged by hand: delete it, rebuild it with `pnpm i`, and `git add` it. If `pnpm-workspace.yaml` is among the paths, resolve it first, since every pnpm command fails to parse it while its markers are there.",
    "",
    "When the resolution is complete, `git add` the paths and run `GIT_EDITOR=true git cherry-pick --continue`. When `--continue` refuses because the resolution came out empty — the remote already carries this commit's whole change — commit it empty with `GIT_EDITOR=true git commit --allow-empty`: the message git prepared names the original, which is the only record that the change was carried rather than dropped. Never `--skip`, `--abort` or `--quit`.",
    "",
    "Run no check and no test, and repair nothing in any other commit: the push does not wait on either. Work in this worktree only: never push, never switch branches, never amend, never rewrite history beyond this pick, and never run `gh`. Launch no subagents.",
    "",
    "When the pick has completed, leave the working tree clean with no cherry-pick in progress.",
  ].join("\n");
