# Running Agents

Read while a subagent is running, or before launching several at once.

- **Never pass `isolation: "worktree"` to the Agent tool.** It is refused here, because `.claude` is a committed symlink to `.agents`, so the call fails with no agent started. Create the worktree by hand first, on a branch, under the agent tree's gitignored worktrees folder: `git worktree add -b <name> .agents/worktrees/<name> origin/ai/queue`. Then the agent's prompt names that path and tells it to work only there and never to touch `.claude`. A brief that puts the agent in the main checkout is the failure this bullet exists to stop, since the main session writes there too. The `review-queue` skill's loop is the setup, and `pnpm ai:worktree:remove` is the teardown (`references/cleaning-up.md`).
- **A haiku agent stops at the first obstacle unless its prompt names the way past it.**
  - Unprompted, it ends on "the wiki returns 402", "the search API refuses", "too large for this pass" or "needs a design call", with nothing built.
  - So the prompt names the working route for each known obstacle, settles the design calls itself, and says that a report of nothing built is a failed run.
  - A unit that comes back empty is relaunched with the obstacle's route written in, never left.
- **An interim report is not a result.** An agent that ends its turn waiting on its own background run ("the run is still going, I'll commit when it reports") can stop there for good. When no final report follows within the run's expected time, read its commits, take what it left unbuilt, and give that to a new agent; never wait on it again.
- Never spawn a duplicate agent for the same task; wait for the completion notification, then verify its commit yourself (git log, the grep audits, the diff) before building on it. Never read its output file: it is the whole transcript (the `context-efficiency` skill).

## Running several agents at once

The whole flow — waves, the fixer, the compute queue's runners — is `openspec/specs/architecture/agent-batches/design.md`.

Each agent in a batch works in its own worktree on `ai/queue`, set up and landed by the `review-queue` skill's loop, as the first bullet above sets out.

A batch is earned by its prompts: every one a self-contained spec (`references/delegation-prompt.md`), and each unit runs on the family the `llm-delegation` skill's "In a session" table gives its work. The agent settles any further call that the existing code or a public source answers, writing it into the page's Decisions. Its failure mode is agents burning their budget re-reading context and never producing work, which is what a prompt that is a topic instead of a spec produces. The one spec work a batch may take is the fan-out over separate areas that the `openspec` skill (`references/area-passes.md`) allows.

Plan the batch around what the agents touch:

- Each agent owns its unit's new files. A file several agents need — a barrel, an index page, a shared constants file — any of them edits, re-reading it right before each edit and editing only its own lines, as the main session does beside a peer session (the `review-queue` skill).
- Each agent commits its own paths on `ai/queue` as it goes, by pathspec, and never pushes; a commit that sweeps in a peer's lines in a shared file is fine, since both land on the same branch. The main session pushes the queue.
- **No install, no check of the app, and no check run twice.** Each agent's package checks run once, as the throughput skill's recipes set out. Its other checks stay on the files it touched, and it builds only to regenerate a barrel (`vp run build:<directory>` on that package, never `pnpm build`), reads the free memory before a run, and never runs anything against `apps/web`. The recipes are the `throughput` skill's `references/machine-efficiency.md`. When every agent has reported, **one** fixer runs the checks once, as those recipes set out. The agents' typechecks and the fixer's are a batch's exception to the rule that typecheck and lint are CI's alone (the `running-checks` skill, "Settled — do not re-propose"): an agent never pushes, so no CI run checks its commits until the main session pushes the wave.
