# Running Agents

Read while a subagent is running, before launching several at once, or when cleaning up after a batch.

- Never spawn a duplicate agent for the same task; wait for the completion notification, then verify its commit yourself (git log, the grep audits, the diff) before building on it. Never read its output file: it is the whole transcript (the `context-efficiency` skill).

## Running several agents at once

The whole flow — waves, the fixer, the compute queue's runners — is `apps/web/content/docs/architecture/agent-batches.md`.

A batch runs in the one shared checkout, every agent on `ai/queue`, never a worktree: each worktree is a full install, so a batch of them floods memory and disk before any work is written. The Agent tool's `isolation: "worktree"` refuses this repository anyway (`.claude` is a committed symlink, `apps/web/content/docs/architecture/agent-configuration.md`).

A batch is earned by its prompts: every one a self-contained spec (`references/delegation-prompt.md`), each on the cheapest family its work allows: `haiku` for a unit with every call made, `opus` for a unit whose design calls are open and that the agent is trusted to settle inside it, writing each decision into its page — the user asked for opus agents on an area's gaps (2026-10-08). Its failure mode is agents burning their budget re-reading context and never producing work, which is what a prompt that is a topic instead of a spec produces. Ideation, triage and docs authoring stay in the main session, one area at a time; the one docs work a batch may take is the fan-out over separate areas that the `docs` skill allows, an agent per area (`references/area-passes.md`).

Plan the batch around what the agents touch:

- Each agent owns its unit's new files. A file several agents need — a barrel, an index page, a shared constants file — any of them edits, re-reading it right before each edit and editing only its own lines, as the main session does beside a peer session (the `review-queue` skill).
- Each agent commits its own paths on `ai/queue` as it goes, by pathspec, and never pushes; a commit that sweeps in a peer's lines in a shared file is fine, since both land on the same branch. The main session pushes the queue.
- **No install, and no check of the app.** An agent may typecheck, lint, test and build the packages it touched, which takes seconds, and keeps their builds green, since the user's `nuxt dev` loads every package from its `dist`. It builds with `pnpm exec tsdown --no-clean`, never `pnpm build`: a cleaning build that fails on a sibling's half-written edit leaves no `dist` at all and stops the user's page, where a failed `--no-clean` build leaves the last good one. It never runs anything against `apps/web`, whose suite and typecheck take minutes. When every agent has reported, **one** agent runs the batch's remaining checks a single time and fixes what they find; CI on the push is the backstop.

## Cleaning up

A batch leaves nothing to sweep but the branches and worktrees an older batch made. Remove a worktree with `git worktree remove <path>` (it refuses while dirty, which is the signal to look before deleting), then `git worktree prune`, then `git branch -d` per branch. On Windows a worktree with a `node_modules` nests past the 260-character path limit, so `git worktree remove`, `rmdir /s` and `rm -rf` all stop part way; empty the folder with `robocopy <an empty folder> <worktree> /MIR` first, then remove it. The mirror deletes whatever the worktree holds, dirty or not, so it runs only once `git -C <worktree> status --short --ignored` shows nothing worth keeping, or what it shows has been committed or copied out: plain `status` omits ignored files, a local `.env` among them. Use `-d`, never `-D`: the refusal to delete an unmerged branch is the only thing standing between a stale worktree and lost work. **Only branches you created for an agent are yours to sweep.** A branch with a name someone chose deliberately (not the `agent/*` or `worktree-agent-*` pattern) is presumed long-lived: leave it and ask, even when asked to "clean up old branches".
