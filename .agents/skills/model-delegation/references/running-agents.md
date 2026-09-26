# Running Agents

Read while a subagent is running, before launching several at once, or when cleaning up their worktrees and branches.

- The main session may only edit files the agent will not stage — agree the file boundary in the prompt (e.g. agent excludes `proposals/resource/blueprint-*`), and queue everything else until its commit lands.
- Never spawn a duplicate agent for the same task; wait for the completion notification, then verify its commit yourself (git log, spot-check the grep audits) before building on it.

## Running several agents at once

One agent per unit of work, each in its own git worktree (`isolation: "worktree"` on the Agent tool), is the way to run a batch in parallel. The shared-working-tree boundary rule above only holds for a single agent; two agents in one tree trample each other. Isolation is what makes concurrency safe, so it is not optional for a batch.

Fan-out is earned by the prompt and paid for by the budget. The historical failure mode was agents burning their budget re-reading context and never producing work — that happens when the prompt is a topic instead of a spec. Three conditions gate a parallel batch, and all must hold: the user asked for it, every prompt is a self-contained spec-execution task (`references/delegation-prompt.md`), and there are excess tokens to burn. Under a tight budget, or for exploratory, ideation, or docs-authoring work, stay sequential in the main session where judgment compounds.

Plan the batch around what the agents touch:

- Give each agent its own worktree branch cut from `ai/queue` and a stated merge order; a unit that depends on another's output is sequential work, not a parallel agent — fold it into its parent's spec instead.
- Overlap must be additive only (separate rows on a shared component, separate procedures in a shared router). Shared schema sections or a shared write path mean one agent, not two.
- Each agent commits on its worktree branch and opens no pull request: the session merges each branch into `ai/queue` in the stated order (`git` skill, "Merging `main` and the Lockfile") and pushes the queue, and the collector cuts the windows (`review-queue` skill). Verify each landed commit yourself before merging the next on top.

## Cleaning up worktrees

Agent worktrees and their branches outlive the agent. Sweep them once the session has merged the branch into `ai/queue` — `git worktree remove <path>` (it refuses while dirty, which is the signal to look before deleting), then `git worktree prune`, then `git branch -d` per branch. Use `-d`, never `-D`: the refusal to delete an unmerged branch is the only thing standing between a stale worktree and lost work. Orphaned `worktree-agent-*` branches with zero commits beyond `ai/queue` are debris from already-cleaned worktrees and delete cleanly. **Only branches you created for an agent are yours to sweep.** A branch with a name someone chose deliberately (not the `worktree-agent-*` pattern) is presumed long-lived: leave it and ask, even when asked to "clean up old branches" — staleness or a landed merge is not authorization to delete it.
