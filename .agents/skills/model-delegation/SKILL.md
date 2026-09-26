---
name: model-delegation
description: Apply when deciding whether to implement in-session or delegate, and when writing a delegation prompt. Esposter model-delegation conventions — the main session does all thinking (specs, proposals, architecture, review); mechanical implementation is delegated to background subagents with self-contained prompts, but a reading pass over a whole tree stays in the main session because delegation is priced by files read rather than files changed.
---

# Model Delegation — The Main Session Thinks, Subagents Implement

Token budgets are the constraint: the main session's context is where design quality lives and is expensive to rebuild. Spend it on thinking; delegate execution.

The split is by **role, not by model**. Whatever model the session happens to run (`~/.claude/settings.json` sets it), the main session is the thinker and subagents are the implementers — the rule holds when the config changes, and the same model may well sit on both sides.

Which tier answers one judgement — deterministic code, a typed decision, a cheap headless session, a full one — is the `llm-delegation` skill's; this skill splits the roles, that one prices the question.

**Never name a model version anywhere in this repo** — not in skills, docs, workflow scripts, or delegation prompts. Model families ship new versions every few weeks and this project always wants the latest, so write the unversioned family alias only. A version-pinned id (`claude-<family>-<version>`) or a prose family-plus-number is stale the moment it's written and silently keeps work on an old model.

## Division of labor

- **Main session**: specs, proposals, architecture decisions, triage, naming, docs conventions, reviewing agent output. Anything where judgment compounds.
- **Never a subagent to look something up.** Research, web lookups and file reads run in the main session with targeted calls: a subagent is the same model, re-reads what the session already knows and has its report read again, so it spends more tokens in total — it buys wall-clock and a smaller main context, never fewer tokens.
- **Background subagent**: executing an already-written spec — renames, sweeps, migrations, mechanical refactors, well-scoped feature implementation. Launch via the Agent tool with `subagent_type: "general-purpose"`, run in background so the main session keeps working.

The docs skill already encodes the handoff: proposals must be self-contained enough for a cold implementation session. The delegation prompt is that cold session's entire world.

## A reading pass is not delegable work

Delegate by edit ratio, not by tedium: a pass that reads a whole tree to change a fraction of it runs in the main session, because delegation is priced by files read (`references/reading-passes.md`).

## Writing the delegation prompt

The prompt is the agent's whole world: the spec with its judgement calls resolved, the conventions it cannot infer, a done-definition it can prove, git discipline, and a report-back contract (`references/delegation-prompt.md`).

## While the agent runs

Edit only files the agent will not stage; a batch runs one agent per worktree over self-contained specs, merged into `ai/queue` in a stated order; and only the branches you created are yours to sweep (`references/running-agents.md`).

## Code reviews

A review is the thinking role, and it is the exception to this skill: the full convention — single entry point, the two lanes, the window, findings handling — lives in the `code-review` skill, which runs the whole review in the main session, because delegation is priced by files read and a review reads the window twice. Load it on any review request, and never the built-in `/review` command.

**A delegated fix round carries that skill's closing checklist verbatim in its prompt** (`code-review`, `references/fixing-findings.md`). An agent handed only a findings list optimises for the finding: it makes each one's own test pass and stops, which is precisely how a round ships a worse defect than it closed — a guard exempted, a sibling site left behind, a mitigation asserted in a comment and never written. The checklist is what the prompt's done-definition is built from, alongside the usual grep audits.

## Design for agents

Every feature is designed agentic-first: resource creation (and eventually most authoring) may be done by AI, so specs must keep that path open — content is schema-validated JSON, writes go through ordinary validated procedures, no hidden client-side state, validation before side effects. `apps/web/content/docs/resource/blueprint-resource.md` is the canonical statement: whatever creates resources — human, form, or model — goes through the same front door.

## Reference pages

- `references/reading-passes.md` — when a task reads a whole tree to change part of it.
- `references/delegation-prompt.md` — when writing a subagent's prompt.
- `references/running-agents.md` — while an agent runs, before a parallel batch, or when cleaning up worktrees.
