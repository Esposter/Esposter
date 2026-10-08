# Running Agents

Read while a subagent is running, before launching several at once, or when cleaning up their worktrees and branches.

- The main session may only edit files the agent will not stage — agree the file boundary in the prompt (e.g. agent excludes `proposals/resource/blueprint-*`), and queue everything else until its commit lands.
- Never spawn a duplicate agent for the same task; wait for the completion notification, then verify its commit yourself (git log, the grep audits, the diff) before building on it. Never read its output file: it is the whole transcript (the `context-efficiency` skill).

## Running several agents at once

One agent per unit of work, each in its own git worktree (`isolation: "worktree"` on the Agent tool), is the way to run a batch in parallel. The shared-working-tree boundary rule above only holds for a single agent; two agents in one tree trample each other.

A batch is earned by its prompts: every one a self-contained spec (`references/delegation-prompt.md`), each on the cheapest family its work allows. Its failure mode is agents burning their budget re-reading context and never producing work, which is what a prompt that is a topic instead of a spec produces. Ideation, triage and docs authoring stay in the main session, one area at a time (the `docs` skill, `references/area-passes.md`).

Plan the batch around what the agents touch:

- Give each agent its own worktree branch cut from `ai/queue` and a stated landing order; a unit that depends on another's output is sequential work, not a parallel agent — fold it into its parent's spec instead.
- Overlap must be additive only (separate rows on a shared component, separate procedures in a shared router). Shared schema sections or a shared write path mean one agent, not two.
- A worktree starts without `node_modules`: the prompt has the agent run `pnpm i --frozen-lockfile --prefer-offline` before anything else and never commit the `pnpm-lock.yaml` that leaves behind.
- Each agent commits on its worktree branch and opens no pull request: the session brings each branch onto `ai/queue` in the stated order — rebased onto the queue and fast-forwarded, never a merge commit, since the collector ports the queue with `--no-merges` and a merge's own conflict resolution would never reach a window (the `review-queue` skill, "The refs"), with a lockfile conflict settled as the `git` skill's `references/lockfile-merges.md` says — and pushes the queue, and the collector cuts the windows. Verify each landed commit yourself before bringing the next on top.

## Cleaning up worktrees

Agent worktrees and their branches outlive the agent. Sweep them once the session has landed the branch on `ai/queue` — `git worktree remove <path>` (it refuses while dirty, which is the signal to look before deleting), then `git worktree prune`, then `git branch -d` per branch. Use `-d`, never `-D`: the refusal to delete an unmerged branch is the only thing standing between a stale worktree and lost work. Orphaned `worktree-agent-*` branches with zero commits beyond `ai/queue` are debris from already-cleaned worktrees and delete cleanly. **Only branches you created for an agent are yours to sweep.** A branch with a name someone chose deliberately (not the `worktree-agent-*` pattern) is presumed long-lived: leave it and ask, even when asked to "clean up old branches" — staleness or a landed merge is not authorization to delete it.
