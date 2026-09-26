---
name: skill-authoring
description: Apply when creating, editing, splitting, merging, or reviewing any SKILL.md or references page, when a session discovers or corrects a convention, or when deciding which skill a new rule belongs in. Esposter skill-writing conventions for .agents/skills — one topic per page with SKILL.md as the one-line always-on layer and an index, every rule in exactly one skill and one page, session learnings captured in the owning skill rather than memory, and a Settled list against size-first splitting, shaving prose, markdown links, paths: frontmatter and hand-kept copies of what a script derives.
---

# Skill Authoring

How to write and maintain a `.agents/skills/*/SKILL.md`. Which skill owns what is read off each skill's `description`, with the boundaries no description settles in `.agents/skills/README.md`; this skill owns how any one skill is written.

## Settled — do not re-propose

- **Shaving prose to make a page smaller.** Separate the topics instead (`references/splitting-a-skill.md`) — a rule's reasoning, its example and a settled entry's argument are never cut to save bytes; they move with their topic.
- **Waiting for the size ceiling before splitting.** Modularity comes first: a topic with a narrower trigger than its skill's domain is its own `references/` page the moment it is recognised, however small either page ends up. The session that notices one runs the split in the same change and reports nothing — a mixed page is a to-do with one known fix, never a finding.
- **A size target, or a second size number beside the ceiling** — a warn threshold, a split-now line, a percentage, a line count. A page is as long as its one topic takes; the sweep's `budget` warning is a backstop for a split that was missed, never the trigger for one.
- **Moving an over-budget section to a `references/` page here when it is another skill's subject.** It becomes two shallow copies of one topic; it moves to the skill that owns it (`references/splitting-a-skill.md`).
- **Recording a one-off as context worth preserving** — the file it went wrong in, the fix that was applied. The commit already holds it with more detail and a date, and a one-off in a skill reads as a standing rule (`references/what-belongs.md`).
- **Restating a rule an enforcer already checks**, for completeness. It fails the build on violation, so the prose only rots when the rule changes (`references/enforced-rules.md`).
- **Citing a page as a markdown link** — a relative hop or a `github.com/.../blob/...` url. Nothing resolves a link out of a skill; the repo-relative path in backticks is what a reader greps (`references/citations.md`).
- **A diagram to make a rule list scannable.** A diagram of a list is decoration; only an ordered cycle with a gate earns one (`references/diagrams.md`).
- **Keeping a session's learning in private memory or the conversation** rather than the owning skill. It dies with the session that learned it (`references/session-learnings.md`).
- **A `description` that enumerates the body's sections.** The listing shows a fixed prefix of it and a trigger written last is the first thing cut, and every section edit becomes a description edit too. The trigger opens it, the domain is a sentence, and the body indexes itself with its headings (`references/frontmatter.md`).
- **Scoping a skill with `paths:` frontmatter.** Claude Code then loads it only while a file matching the globs is being worked on, so a question asked with no file in hand never loads it. Which skills a review window's files hit is the `code-review` skill's routing table, and that table is a rule rather than a copy of anything.
- **Stamping a skill or a page with the model that wrote it** — a `model:` frontmatter key, a byline, a date. Claude Code reads `model` in a skill's frontmatter as the model to _run_ it on, so the key changes behaviour, and any other stamp is a hand copy of the commit's `Co-Authored-By` trailer. The stamp is the skill's row in `.agents/ledgers/docs/skills.md`, which `pnpm ai:sweep:ledger-coverage` dates and names from the trailers (`references/skill-coverage.md`).
- **A hand-maintained copy of a fact the tree or git already holds** — a roster of the skills, a ledger row's date, a citation's path after a move. It drifts the moment the fact changes and nothing fails; a script derives it (`references/derived-surfaces.md`).

## Rules

- **One topic per page, each page the single source of its topic.** `SKILL.md` holds the rules every task in the domain needs, one line each, and an index; every narrower topic — a procedure, a file type, a sub-task, a rule's full argument — is a `references/` page, however small (`references/splitting-a-skill.md`).
- **The index line names the trigger, not the topic** — _when a test installs fake timers_, never "see X for more detail", which guarantees the page is never opened (`references/splitting-a-skill.md`).
- **A rule lives in exactly one skill and one page**; every other mention is a one-line pointer to it, never a paraphrase. `pnpm ai:sweep:duplicate-prose` lists the copies (`references/one-owner-per-topic.md`).
- **A convention a session discovers or corrects lands in the owning skill in the same session**, never in private memory; a claim the evidence contradicts is verified and fixed, never obeyed (`references/session-learnings.md`).
- **A rule an enforcer checks is owned by the enforcer**: one line with the non-obvious why and the enforcer's name, never the banned forms or the error text (`references/enforced-rules.md`).
- **A citation is the repo-relative path in backticks**, never a markdown link, and another skill is cited by name plus its page; `scripts/src/workspace/citations.test.ts` resolves every one (`references/citations.md`).
- **The `description` opens `Apply when …`**, names the domain in a sentence, and never indexes the body (`references/frontmatter.md`).
- **Nothing a script derives is written by hand** — a roster, a count, a date, a citation's path after a move (`references/derived-surfaces.md`).
- **A rejected direction goes in `## Settled — do not re-propose`, the first section** (`references/settled-lists.md`).
- **An exception names the forcing agent outside our control**, or it is not one (`references/exceptions.md`).
- **A recipe with control flow is a script** under `scripts/src/<domain>/<verb>/` with a test and an `ai:` name, never a fence (`references/embedded-recipes.md`).
- **Only an ordered cycle with a gate earns a diagram** (`references/diagrams.md`).
- **A commit that reads a whole skill — `SKILL.md` and every page — against these rules carries `Ledger: docs/skills | `<skill>``**; a change to these rules carries `Reopens: docs/skills`, so every skill an older rule set or an older model read is open again (`references/skill-coverage.md`).
- **Tight, not fluffy**: a why only where it is non-obvious and load-bearing, a worked example only where the prose is ambiguous without it, and no example values that will rot.
- **Repo skills and `~/.claude/rules/*.md` can contradict each other** — the precedence and the current split are `.agents/skills/README.md` ("Skills vs global rules").

## Reference pages

- `references/splitting-a-skill.md` — when a page holds a second topic, a section is moving out, or a `references/` page is being created: the two tiers, what moves and what stays, and the pointers a move breaks.
- `references/one-owner-per-topic.md` — when a rule could fit two skills, a pointer is being written, or a plugin skill shares a subject or a name with a repo one.
- `references/session-learnings.md` — when a session discovered a convention or found a skill claim that evidence contradicts.
- `references/enforced-rules.md` — when writing about a rule a typecheck, lint rule, formatter or test already enforces.
- `references/citations.md` — when citing a file, a page or another skill.
- `references/frontmatter.md` — when writing or revising a `description`.
- `references/derived-surfaces.md` — before writing any table, list, roster or date by hand.
- `references/settled-lists.md` — when recording a rejected direction.
- `references/exceptions.md` — when writing an exception, or reading one that cannot name its source.
- `references/embedded-recipes.md` — when embedding a command, or moving one out of a fence.
- `references/diagrams.md` — when considering a `mermaid` block in a skill.
- `references/what-belongs.md` — when deciding whether a fact, a one-off or a history belongs in a skill at all.
- `references/skill-coverage.md` — when a commit has read a whole skill, changed these rules, or a session asks which skills a newer model has not yet read.
- `references/enforceable-shapes.md` — when a rule could be written as a shape a script decides rather than an intent a reader judges.
