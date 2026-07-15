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
2. **Repo conventions the agent can't infer** — always `pnpm`, never `npx`; verify with `pnpm format` + typecheck (and relevant tests); lint with `pnpm lint:fix:packages` from the root for `packages/*`, but **skip lint entirely when the change touches `packages/app`** (slow — leave it to CI); `try/catch` banned (getResult/getResultAsync + `.match`); no relative imports (`@/`, `#shared`, `@esposter/*`); never run `db:gen`/`db:up` — hand-craft migration folders (`migration.sql` + `snapshot.json` cloned from latest with fresh `id`/`prevIds`) when the spec needs one, and report that the user must apply it.
3. **A verifiable done-definition** — grep audits that must return zero hits, test files that must pass. "Done" the agent can prove beats "done" it can claim.
4. **Git discipline** — commit style from the git skill; push when green. **Never `git add -A`**: other sessions' WIP may be dirty (historically `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `scripts/refreshLockfile.ps1`, but check `git status` fresh) — stage explicit paths only.
5. **Report-back contract** — files changed, judgment calls made, verification results, and anything only the user can do (e.g. `pnpm db:up`).

## While the agent runs

- The main session may only edit files the agent will not stage — agree the file boundary in the prompt (e.g. agent excludes `proposals/platform/blueprint-*`), and queue everything else until its commit lands.
- Never spawn a duplicate agent for the same task; wait for the completion notification, then verify its commit yourself (git log, spot-check the grep audits) before building on it.

## Design for agents

Every feature is designed agentic-first: resource creation (and eventually most authoring) may be done by AI, so specs must keep that path open — content is schema-validated JSON, writes go through ordinary validated procedures, no hidden client-side state, validation before side effects. The [Blueprint proposal](../../../packages/app/content/docs/proposals/platform/blueprint-resource.md) is the canonical statement: whatever creates resources — human, form, or model — goes through the same front door.
