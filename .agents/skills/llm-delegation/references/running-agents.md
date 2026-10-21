# Running Agents

Read while a subagent is running, or before launching several at once.

- **Never pass `isolation: "worktree"` to the Agent tool.** It is refused here, because `.claude` is a committed symlink to `.agents`, so the call fails with no agent started. Create the worktree by hand first, on a branch, under the agent tree's gitignored worktrees folder: `git worktree add -b <name> .agents/worktrees/<name> origin/ai/queue`. Then the agent's prompt names that path and tells it to work only there and never to touch `.claude`. The `review-queue` skill's loop (`.agents/skills/review-queue/SKILL.md`) is the setup, and `pnpm ai:worktree:remove` is the teardown (`references/cleaning-up.md`).
- **A haiku agent stops at the first obstacle unless its prompt names the way past it.**
  - Unprompted, it ends on "the wiki returns 402", "the search API refuses", "too large for this pass" or "needs a design call", with nothing built.
  - So the prompt names the working route for each known obstacle, settles the design calls itself, and says that a report of nothing built is a failed run.
  - A unit that comes back empty is relaunched with the obstacle's route written in, never left.
- **An interim report is not a result.** An agent that ends its turn waiting on its own background run ("the run is still going, I'll commit when it reports") can stop there for good. When no final report follows within the run's expected time, read its commits, take what it left unbuilt, and give that to a new agent; never wait on it again.
- Never spawn a duplicate agent for the same task; wait for the completion notification, then verify its commit yourself (git log, the grep audits, the diff) before building on it. Never read its output file: it is the whole transcript (`.agents/skills/context-efficiency/SKILL.md`).

## Running several agents at once

The whole flow — waves, the fixer, the compute queue's runners — is `openspec/specs/architecture/agent-batches/design.md`.

Each agent in a batch works in its own worktree on `ai/queue`, set up and landed by the `review-queue` skill's loop (`.agents/skills/review-queue/SKILL.md`). The Agent tool's `isolation: "worktree"` refuses this repository anyway (`.claude` is a committed symlink, `openspec/specs/architecture/agent-configuration/design.md`).

A batch is earned by its prompts: every one a self-contained spec (`references/delegation-prompt.md`), and every unit runs on `haiku`. Implementation is haiku's: the main session settles a unit's calls in its prompt, and the agent settles any further call that the existing code or a public source answers, writing it into the page's Decisions. A screen brought to the game's likeness, a fix whose cause is found, a compute-queue runner and the wave's fixer are all haiku's. No agent runs on another family (the `llm-delegation` skill's Settled list). Haiku takes each screen and nearly every implementation, since opus spends most of the usage. Its failure mode is agents burning their budget re-reading context and never producing work, which is what a prompt that is a topic instead of a spec produces. Ideation, triage and docs authoring stay in the main session, one area at a time; the one spec work a batch may take is the fan-out over separate areas that the `openspec` skill allows, an agent per area (`.agents/skills/openspec/references/area-passes.md`).

Plan the batch around what the agents touch:

- Each agent owns its unit's new files. A file several agents need — a barrel, an index page, a shared constants file — any of them edits, re-reading it right before each edit and editing only its own lines, as the main session does beside a peer session (`.agents/skills/review-queue/SKILL.md`).
- Each agent commits its own paths on `ai/queue` as it goes, by pathspec, and never pushes; a commit that sweeps in a peer's lines in a shared file is fine, since both land on the same branch. The main session pushes the queue.
- **No install, no check of the app, and no check run twice.** Each agent's package checks run once, as the throughput skill's recipes set out. Its other checks stay on the files it touched, and it builds only to regenerate a barrel (`vp run build:<directory>` on that package, never `pnpm build`), reads the free memory before a run, and never runs anything against `apps/web`. The recipes are the `throughput` skill's `references/machine-efficiency.md`. When every agent has reported, **one** fixer runs the checks once, as those recipes set out. The agents' typechecks and the fixer's are a batch's exception to the `running-checks` skill's rule (`.agents/skills/running-checks/SKILL.md`) that typecheck and lint are CI's alone: an agent never pushes, so no CI run checks its commits until the main session pushes the wave.
