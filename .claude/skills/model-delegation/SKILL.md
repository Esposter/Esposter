---
name: model-delegation
description: Esposter model-delegation conventions — the main session does all thinking (specs, proposals, architecture, review); mechanical implementation is delegated to background subagents with self-contained prompts. Apply when deciding whether to implement in-session or delegate, and when writing a delegation prompt.
---

# Model Delegation — The Main Session Thinks, Subagents Implement

Token budgets are the constraint: the main session's context is where design quality lives and is expensive to rebuild. Spend it on thinking; delegate execution.

The split is by **role, not by model**. Whatever model the session happens to run (`~/.claude/settings.json` sets it), the main session is the thinker and subagents are the implementers — the rule holds when the config changes, and the same model may well sit on both sides.

## Division of labor

- **Main session**: specs, proposals, architecture decisions, triage, naming, docs conventions, reviewing agent output. Anything where judgment compounds.
- **Background subagent**: executing an already-written spec — renames, sweeps, migrations, mechanical refactors, well-scoped feature implementation. Launch via the Agent tool with `subagent_type: "general-purpose"`, run in background so the main session keeps working.

The docs skill already encodes the handoff: proposals must be self-contained enough for a cold implementation session. The delegation prompt is that cold session's entire world.

## Writing the delegation prompt

The agent starts with zero conversation context. The prompt must carry:

1. **The spec** — point at the proposal file (or inline it) and pre-resolve every judgment call you can: exact rename maps, negative lists (what NOT to touch), edge cases already decided. Ambiguity left in the prompt becomes a judgment call made without you.
2. **Repo conventions the agent can't infer** — always `pnpm`, never `npx`; verify with `pnpm format` + typecheck (and relevant tests); lint with `pnpm lint:fix:packages` from the root for `packages/*`, but **skip lint entirely when the change touches `packages/app`** (slow — leave it to CI); `try/catch` banned (getResult/getResultAsync + `.match`); no relative imports (`@/`, `#shared`, `@esposter/*`); never run `db:gen`/`db:up` and never hand-craft migration folders (cloning `snapshot.json` forks the migration chain — `db:gen` is the only sanctioned producer); when the spec needs a migration, edit the Drizzle schema only (the TS types alone keep typecheck green) and report that the user must run `pnpm db:gen` and apply it.
3. **A verifiable done-definition** — grep audits that must return zero hits, test files that must pass. "Done" the agent can prove beats "done" it can claim.
4. **Git discipline** — commit style from the git skill; push when green. **Never `git add -A`**: other sessions' WIP may be dirty (historically `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `scripts/refreshLockfile.ps1`, but check `git status` fresh) — stage explicit paths only.
5. **Report-back contract** — files changed, judgment calls made, verification results, and anything only the user can do (e.g. running `pnpm db:gen` for a pending schema change).

## While the agent runs

- The main session may only edit files the agent will not stage — agree the file boundary in the prompt (e.g. agent excludes `proposals/platform/blueprint-*`), and queue everything else until its commit lands.
- Never spawn a duplicate agent for the same task; wait for the completion notification, then verify its commit yourself (git log, spot-check the grep audits) before building on it.

## Running several agents at once

One agent per PR, each in its own git worktree (`isolation: "worktree"` on the Agent tool), is the way to open a batch of PRs in parallel. The shared-working-tree boundary rule above only holds for a single agent; two agents in one tree trample each other. Isolation is what makes concurrency safe, so it is not optional for a batch.

Fan-out is earned by the prompt and paid for by the budget. The historical failure mode was agents burning their budget re-reading context and never producing work — that happens when the prompt is a topic instead of a spec. Two conditions gate a parallel batch, and both must hold: every prompt is a self-contained spec-execution task per the section above, and there are excess tokens to burn. Under a tight budget, or for exploratory, ideation, or docs-authoring work, stay sequential in the main session where judgment compounds.

Plan the batch around what the agents touch:

- Size each PR to **fill the review budget, not just stay under it** — ~80 changed files per PR (see the coderabbit skill's "PR File Budget"). A single proposal is typically 10–25 files; one-proposal-per-agent wastes most of a review slot and multiplies review rounds. Batch several related proposals from the same area into one agent's spec so its single PR approaches the budget.
- Give each agent its own branch cut from `develop` and a stated merge order; a PR that depends on another's output is a stacked branch, not a parallel one — fold it into its parent's PR instead.
- Overlap must be additive only (separate rows on a shared component, separate procedures in a shared router). Shared schema sections or a shared write path mean one PR, not two agents.
- Each agent commits, pushes, and opens its own PR from its worktree. Verify each landed commit yourself before the next PR merges on top.

## Cleaning up worktrees

Agent worktrees and their branches outlive the agent. Sweep them once their PR merges — `git worktree remove <path>` (it refuses while dirty, which is the signal to look before deleting), then `git worktree prune`, then `git branch -d` per branch. Use `-d`, never `-D`: the refusal to delete an unmerged branch is the only thing standing between a stale worktree and lost work. Orphaned `worktree-agent-*` branches with zero commits beyond `develop` are debris from already-cleaned worktrees and delete cleanly. Never sweep a long-lived branch you did not create — `nuxt5` and `migrate-assets` in particular are keepers (user-confirmed 2026-07-18), even when asked to "clean up old branches"; staleness or a merged PR is not authorization to delete a named long-lived branch.

## Code reviews

Reviews are execution roles, not the thinking role. The full convention — single entry point, opus-pinned workflow script, scriptPath invocation, findings handling — lives in the `code-review` skill; load it on any review request. Never review inline in the session and never use the `review` skill.

## Design for agents

Every feature is designed agentic-first: resource creation (and eventually most authoring) may be done by AI, so specs must keep that path open — content is schema-validated JSON, writes go through ordinary validated procedures, no hidden client-side state, validation before side effects. The [Blueprint proposal](../../../packages/app/content/docs/proposals/platform/blueprint-resource.md) is the canonical statement: whatever creates resources — human, form, or model — goes through the same front door.
