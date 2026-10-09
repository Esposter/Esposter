# Running Agents

Read while a subagent is running, before launching several at once, or when cleaning up after a batch.

- **A haiku agent stops at the first obstacle unless its prompt names the way past it.**
  - Unprompted, it ends on "the wiki returns 402", "the search API refuses", "too large for this pass" or "needs a design call", with nothing built.
  - So the prompt names the working route for each known obstacle (the repo's own wiki reader, yt-dlp's `bilisearch:`/`ytsearch:`, the dump's fallback source), settles the design calls itself, and says that a report of nothing built is a failed run.
  - A unit that comes back empty is relaunched with the obstacle's route written in, never left.
- **An interim report is not a result.** An agent that ends its turn waiting on its own background run ("the run is still going, I'll commit when it reports") can stop there for good. When no final report follows within the run's expected time, read its commits, take what it left unbuilt, and give that to a new agent; never wait on it again.
- Never spawn a duplicate agent for the same task; wait for the completion notification, then verify its commit yourself (git log, the grep audits, the diff) before building on it. Never read its output file: it is the whole transcript (the `context-efficiency` skill).

## Running several agents at once

The whole flow — waves, the fixer, the compute queue's runners — is `apps/web/content/docs/architecture/agent-batches.md`.

A batch runs in the one shared checkout, every agent on `ai/queue`, never a worktree: each worktree is a full install, and a batch of them floods the machine's memory and disk before an agent writes a line. The Agent tool's `isolation: "worktree"` refuses this repository anyway (`.claude` is a committed symlink, `apps/web/content/docs/architecture/agent-configuration.md`).

A batch is earned by its prompts: every one a self-contained spec (`references/delegation-prompt.md`), and every unit runs on `haiku`. Implementation is haiku's: the main session settles a unit's calls in its prompt, and the agent settles any further call that the existing code or a public source answers, writing it into the page's Decisions. A screen brought to the game's likeness, a fix whose cause is found, a compute-queue runner and the wave's fixer are all haiku's. An `opus` agent never implements; it may write a spec or a proposal too large for the main session. The user moved this line twice on 2026-10-08: first opus agents on an area's gaps, then haiku per screen and for nearly every implementation, since opus was spending most of the usage. Its failure mode is agents burning their budget re-reading context and never producing work, which is what a prompt that is a topic instead of a spec produces. Ideation, triage and docs authoring stay in the main session, one area at a time; the one docs work a batch may take is the fan-out over separate areas that the `docs` skill allows, an agent per area (`references/area-passes.md`).

Plan the batch around what the agents touch:

- Each agent owns its unit's new files. A file several agents need — a barrel, an index page, a shared constants file — any of them edits, re-reading it right before each edit and editing only its own lines, as the main session does beside a peer session (the `review-queue` skill).
- Each agent commits its own paths on `ai/queue` as it goes, by pathspec, and never pushes; a commit that sweeps in a peer's lines in a shared file is fine, since both land on the same branch. The main session pushes the queue.
- **No install, no check of the app, and no check run twice.** Each agent typechecks the packages it edited once, before its commit, with their own incremental checks. Its other checks stay on the files it touched, and it builds only to regenerate a barrel (`pnpm exec tsdown --no-clean`, never `pnpm build`), reads the free memory before a run, and never runs anything against `apps/web`. The recipes are the `throughput` skill's `references/machine-efficiency.md`. When every agent has reported, **one** fixer runs the checks once, as those recipes set out. The agents' typechecks and the fixer's are a batch's exception to the `running-checks` skill's rule that typecheck and lint are CI's alone: an agent never pushes, so no CI run checks its commits until the main session pushes the wave.

## Cleaning up

A batch leaves nothing to sweep but the branches and worktrees an older batch made. Remove a worktree with `bash .agents/skills/throughput/scripts/remove-worktree.sh <path>`, never `git worktree remove` by hand: that deletes through any junction into the shared checkout's `node_modules` (on 2026-10-09 it emptied the root install), so the script unlinks the junctions first, then removes the worktree and prunes it. Git still refuses a dirty worktree, which is the signal to look before deleting, then `git branch -d` per branch. On Windows a worktree with a `node_modules` nests past the 260-character path limit, so `git worktree remove`, `rmdir /s` and `rm -rf` all stop part way; empty the folder with `robocopy <an empty folder> <worktree> /MIR` first, then remove it. The mirror deletes whatever the worktree holds, dirty or not, so it runs only once `git -C <worktree> status --short --ignored` shows nothing worth keeping, or what it shows has been committed or copied out: plain `status` omits ignored files, a local `.env` among them. Use `-d`, never `-D`: the refusal to delete an unmerged branch is the only thing standing between a stale worktree and lost work. **Only branches you created for an agent are yours to sweep.** A branch with a name someone chose deliberately (not the `agent/*` or `worktree-agent-*` pattern) is presumed long-lived: leave it and ask, even when asked to "clean up old branches".

## A batch that rebuilds the collector

The review collector runs from `ai/queue`'s own checkout on every queue push, so a batch committing a change to the collector's code would run each half-wired step against GitHub the moment any session pushes. While such a batch commits, the collector's workflow is disabled (`gh workflow disable ReviewCollector.yaml`), so the queue keeps pushing for everyone else. It is enabled again once the change is reviewed, fixed and pushed. The collector run by hand with its workflow off is the `review-queue` skill's `references/running-by-hand.md`.

- **A new wave is a new inline script.** Re-invoking a workflow by its `scriptPath` reruns that same wave, with its own agents and labels, whatever `args` it is handed. Passing an older wave's path to start a different one launches a duplicate of the older wave. Write each new wave's script inline, and use `scriptPath` only to resume or re-run that very script.
