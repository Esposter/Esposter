# The usage reserve

Read when a usage window reaches its maintenance or wind-down line, and the session must decide what to start, keep or wind down while it holds.

**Scope.** The reserve is for a local plan's usage windows. A cloud session spends the account's API cloud credit, which has its own balance and which the windows' percentages do not measure, so none of the steps below apply to it: a cloud session keeps working to the end of its task. A window's line is never a reason for a cloud session to stop, to hand its remaining units off, or to report back early. Where a reserve notice in its prompt restricts agents or workflows, the session does the work in its main thread instead, and it stops only when its task is done or a step is blocked on something only the user can supply. The mod's own skip for a cloud session is its design's open item (`openspec/specs/infra/claude-interface/genshin-mods/resin/design.md`, "Usage reserve"). A refusal the mod makes is the mod's, not the window's: the session takes the denial's own options, a `haiku` agent or a follow-up, and carries on.

The plan's usage is spent by the session and its agents, while a compute-queue run spends the machine and only needs a cheap `haiku` runner to start it. So each usage window keeps some of its end for the runners, and a session never runs dry with long runs still owed. The `genshin-mods` cache-and-handoff mod reads both windows against their lines, both windows having both tiers, and puts the reserve into the session's system prompt naming the window and its reset time. The prompt only describes the reserve, so the mod also enforces the model at launch: while a reserve holds, a workflow, a fork and any agent not on `haiku` are refused, and an agent that gets through runs on `haiku` whatever the tier. The mod's page, `openspec/specs/infra/claude-interface/genshin-mods/resin/design.md`, owns the lines' names and values, so the tiers below name only what the session does at each one. Where both windows have crossed a line, the stricter state wins, so wind-down beats maintenance.

## Maintenance

A window's end past its maintenance line is spent, not saved: the five-hour window's unused end is lost at its reset, and the weekly one's is the margin that lets the work in flight land before the wind-down. `haiku` stretches either furthest, because limits weigh a token by its family. From a window's maintenance tier, entered at its line or by spending ahead of an even pace, until it resets, the session:

1. Spends the rest of the window on `haiku` agents for cleanup: fixes the findings of a code review of the window's own recent commits; drains an open sweep ledger (the `sweeps` skill); brings the docs and skills in line with the code changed this window (the Key-files sweep in `AGENTS.md`'s finishing steps); fixes CI's typecheck and lint reds; and lands the refactors, simplifications and optimisations the compute queue's runs surfaced.
2. Writes a finding that needs judgement down as a follow-up (the `follow-ups` plugin's capture skill), not decided on `haiku`.
3. Keeps the compute queue's runners going.

## Wind-down

From a window's wind-down line until it resets, the session:

1. Starts nothing new that thinks or builds: no implementation agent, no workflow, no proposal.
2. Sends each running implementation agent its wrap-up: commit what builds, then end on a handoff spec that a `haiku` agent can build cold.
3. Writes every open item down where `pnpm ai:resume` and its handoff order find it (the `resuming` skill), with what it takes to resume it cold: the paths, what is done, the calls already made, the next step. Genshin work goes on its roadmap, a handoff spec into its proposal page, never only the scratchpad. Anything else goes in as a follow-up through the `follow-ups` plugin's capture skill.
4. Commits the edit in hand and the records just written by pathspec, and pushes the queue.
5. Cleans up the page servers, shells, monitors and worktrees nothing still uses.
6. Keeps the compute queue's runners going, one per lane, until the window resets and the reserve lifts by itself.
