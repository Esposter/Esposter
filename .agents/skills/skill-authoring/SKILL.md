---
name: skill-authoring
description: Apply when creating, editing, splitting, merging, or reviewing any SKILL.md, when a session discovers or corrects a convention, or when deciding which skill a new rule belongs in. Esposter skill-writing conventions for .agents/skills — a Settled list (shaving prose under the size ceiling, a second size number, size as a finding, another skill's subject as a reference page here, a one-off as context, restating an enforcer, markdown links, diagramming a rule list, private memory, a description that indexes the body, paths: frontmatter, a hand-maintained copy of what the tree or git holds), one owner per topic, capturing session learnings in the owning skill, the two-tier SKILL.md and references/ layout, citing a page by its repo path, and the surfaces a script derives — plus deep dives on the frontmatter (a trigger-first description inside the listing's cap), what a skill may record, decidable shapes, Settled lists, exceptions, splitting a skill, diagrams, and embedded recipes.
---

# Skill Authoring

How to write and maintain a `.agents/skills/*/SKILL.md`. Which skill owns what is read off each skill's `description`, with the boundaries no description settles in `.agents/skills/README.md`; this skill owns how any one skill is written.

## Settled — do not re-propose

- **Shaving prose to bring a skill under the size ceiling.** Separate the topics instead (`references/splitting-a-skill.md`, which argues it) — a rule's reasoning, its example and a settled entry's argument are never cut to land under the number, and a skill with no narrow trigger left to move stays over, saying so in the commit, rather than shaved.
- **Raising a skill's size or its prose volume as a finding or a design concern.** A skill the sweep's `budget` warning names is a to-do with one known fix — separate the narrow-trigger topics (`references/splitting-a-skill.md`) — so the session that notices it runs the split in the same change and reports nothing; "too much prose" is never a review finding, an audit line or a reason a design is not the simplest, because the answer to it is already written here and only its application is owed.
- **A second size number below the ceiling** — a warn threshold, a split-now line, a percentage. One number is what there is to maintain, and the sweep's `budget` warning is the whole trigger ("SKILL.md is the always-on layer", which argues it).
- **Moving an over-budget section to a `references/` page here when it is another skill's subject.** It becomes two shallow copies of one topic; it moves to the skill that owns it (`references/splitting-a-skill.md`).
- **Recording a one-off as context worth preserving** — the file it went wrong in, the fix that was applied. The commit already holds it with more detail and a date, and a one-off in a skill reads as a standing rule (`references/what-belongs.md`).
- **Restating a rule an enforcer already checks**, for completeness. It fails the build on violation, so the prose only rots when the rule changes ("Don't restate what an enforcer already checks").
- **Citing a page as a markdown link** — a relative hop or a `github.com/.../blob/...` url. Nothing resolves a link out of a skill; the repo-relative path in backticks is what a reader greps ("Cite a page by its repo path").
- **A diagram to make a rule list scannable.** A diagram of a list is decoration; only an ordered cycle with a gate earns one (`references/diagrams.md`).
- **Keeping a session's learning in private memory or the conversation** rather than the owning skill. It dies with the session that learned it ("Capture session learnings here").
- **A `description` that enumerates the body's sections.** The listing shows a fixed prefix of it and a trigger written last is the first thing cut, and every section edit becomes a description edit too. The trigger opens it, the domain is a sentence, and the body indexes itself with its headings (`references/frontmatter.md`).
- **Scoping a skill with `paths:` frontmatter.** Claude Code then loads it only while a file matching the globs is being worked on, so a question asked with no file in hand never loads it. Which skills a review window's files hit is the `code-review` skill's routing table, and that table is a rule rather than a copy of anything.
- **A hand-maintained copy of a fact the tree or git already holds** — a roster of the skills, a ledger row's date, a citation's path after a move. It drifts the moment the fact changes and nothing fails; a script derives it ("What a script derives, nobody maintains").

## One owner per topic

A rule lives in exactly **one** skill. Other skills reference it with a one-line pointer (`See the `formatting` skill`), never a paraphrase — a copy drifts, and two half-statements of a rule are harder to follow than one whole one.

- When a rule could fit two skills, it belongs to the **most specific** owner.
- A skill that finds itself explaining another skill's topic to set up its own point should link and move on.
- **A pointer earns its place only when it saves real duplication.** Don't redirect to a section the reader reaches by reading on, and don't replace a self-sufficient one-liner with a "see X" link.
- If a rule fits **no** skill, that's a missing skill — create one rather than overloading an unrelated one. Read the descriptions first.
- **Installed plugin skills are in the same namespace, and a repo skill outranks one wherever their subjects meet.** A plugin ships general practice; a repo skill states what this repo actually does, so it wins — but only if it says so, because a model picking between two descriptions has nothing else to go on. The repo skill names the plugin one in its own exclusion list rather than trusting the general one to defer, and a plugin skill covering a subject no repo skill owns is left alone. The collision that matters most is a shared **name**: two skills called `code-review` are one wrong pick away from a review that never ran the workflow.

## Capture session learnings here, not in private memory

When a session discovers or corrects a convention — a shared primitive that must be reused instead of hand-rolled, a lifecycle rule behind a bug class, a claim in an existing skill that turned out to be stale — it lands in the owning skill **in the same session**, not in an assistant's private memory or the conversation. Skills are the compounding layer: they are what every future session, model, and background agent loads; a lesson recorded anywhere else dies with the session that learned it.

- A learning that changes what the skill is for — its trigger or its domain — is also a frontmatter edit (`references/frontmatter.md`).
- **A skill claim contradicted by evidence gets verified empirically and fixed, never obeyed.** Run the enforcer, reproduce the behavior, then correct the line — a stale rule that keeps being followed compounds exactly like a good one.

## Don't restate what an enforcer already checks

A rule mechanically enforced by typecheck, an ESLint/oxlint rule, `no-restricted-syntax`, a formatter, or a test **is owned by that enforcer** — it fails the build on violation, so prose re-deriving it is dead weight that rots when the rule changes.

When a convention is enforced, the note is **one line**: state it, give the non-obvious _why_ or the fix the error message can't, and point at the enforcer (rule name / file). Don't enumerate every banned form, paste the error text, or re-explain what the rule already says.

Reserve full prose for conventions with **no** enforcer — naming, structure, when-to-use-X, architectural intent. Those are exactly what skills exist to capture.

## SKILL.md is the always-on layer; `references/` holds the rest

A selected skill loads **whole**, so every byte of `SKILL.md` is paid for by every task that trips its trigger — including the tasks that needed one rule from it. **A skill is one isolated concept, and its size is whatever that concept takes** — most are a fraction of the ceiling, and that is the shape to expect, not headroom to fill. `ai:sweep:skill-docs` reports a skill past the ceiling as a `budget` warning, and **that warning is the whole trigger** — a skill it names has stopped being one concept and become a manual nobody reads to the end, which is the same failure as not writing it. There is no second number below it: "close to the ceiling" is an intent, and an intent gets applied at one skill's size by this session and not at a slightly smaller one by the next (`references/enforceable-shapes.md`).

So a skill is two tiers:

- **`SKILL.md`** — the rules that apply to _every_ task in the domain, one line each, plus an index of the deep dives. This is what has to land without anyone asking for it.
- **`references/<topic>.md`** — a rule set that fires only for a _named sub-task_: a ritual, a file type, a single component, a procedure. It is read when the index line matches. **`references/` is the only second tier, and it does not nest**: `ai:sweep:skill-docs` globs `*/SKILL.md` and `*/references/*.md` and nothing else, so a page parked at a skill's root or in a folder of its own is one the budget, index-coverage and citation checks never see.

**The index line carries the split**, and it works like frontmatter: name the trigger, not the topic — as `testing` indexes `references/timers-and-hand-resolved-promises.md` _when a test installs fake timers or holds a call in flight_. An index line that reads "see X for more detail" guarantees the page is never opened.

**Actually moving a section out — `references/splitting-a-skill.md`.** What qualifies, what the ceiling is
measured in and why it is a warning rather than a target, what a reference page's opening lines owe a reader who
arrived by search, and the pointer forms a move silently breaks, is that page.

## Cite a page by its repo path, never by a link

Nothing resolves a link out of a skill: no renderer opens one, and a relative `../../../` hop or a
`github.com/.../blob/main/...` url is a path the reader has to reconstruct or a network fetch they cannot make.
So a citation is the **repo-relative path in backticks** — `apps/web/content/docs/architecture/foo.md` — which
is what a reader greps, opens and edits, and which stays right when the skill moves. A path relative to anything
but the repo root (`docs/architecture/foo.md`) resolves nowhere and is the form that silently rots.

Cite another **skill** by name plus its page (``the `pinia` skill (`references/keyed-state-and-pagination.md`)``),
never as a path into `.agents/skills/`.

## The frontmatter drives selection — `references/frontmatter.md`

The `description` is the only thing read when deciding whether to load a skill, and the listing shows a fixed prefix of it. So it opens `Apply when …`, names the domain in a sentence, and stays inside the cap `ai:sweep:skill-docs` holds it to — never an index of the body's sections, which is what the headings are for. **Writing or revising one** is that page.

## What a script derives, nobody maintains — `references/derived-surfaces.md`

The `docs` skill's rule — never write down what the repo can count — applies to the agent tree too. **Before writing any table, list, roster or date by hand**, which surfaces a script already derives and what to write instead, is that page.

## A rejected direction goes in a list — `references/settled-lists.md`

A settled decision written as prose two thirds down a skill is re-derived by the reader who loaded the very skill that rejects it, so a domain with rejected directions carries `## Settled — do not re-propose` as its first section. **Recording one**, what separates a settled direction from a rule, and why the goal is a short list — a line exists because the owning docs page's diagram did not show the edge the direction would cut, so a growing list is a diagram missing an edge — is that page.

## An exception names what forces it — `references/exceptions.md`

We own the codebase, so an inconvenient rule is a rule to apply anyway; an exception needs a forcing agent outside our control, named. **Writing one, or reading one that cannot name its source**, is that page.

## A recipe with control flow is a script — `references/embedded-recipes.md`

A fence in a skill, a ledger or a docs page holds a program nothing typechecks, lints or runs, so it rots silently — and a scan that cannot run reports nothing, which is the shape of a clean tree. One command whose logic is its pattern stays inline; **anything with control flow, and anything that needs a fix**, moves to `scripts/src/<domain>/<verb>/` with a colocated test and an `ai:`-prefixed pnpm name. **Embedding a command, or moving one out of a fence**, is that page.

## A cycle earns a diagram — `references/diagrams.md`

Most skills are rule lists, and a diagram of a list is decoration. **Considering a `mermaid` block in a skill** — the three conditions its subject has to meet, and why an ordered process with a gate is the only subject that meets them — is that page.

## Tight, not fluffy

One line per rule where possible. Cut redundant prose and example values that will rot. A skill is read under context pressure — every line competes with the code the reader actually needs.

Long-form prose is the tell. A rule needs its _why_ only where the why is non-obvious and load-bearing; a paragraph re-arguing a rule already stated is the part to cut, and a worked example earns its place only when the prose form is ambiguous without it.

## Skills vs `~/.claude/rules/*.md`

Repo skills and the user's global rules are **two trees that can contradict each other**, and the reader has no way to tell which wins. See `.agents/skills/README.md` ("Skills vs global rules") for the precedence rule and the current split.
