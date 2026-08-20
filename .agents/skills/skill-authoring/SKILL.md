---
name: skill-authoring
description: Esposter skill-writing conventions for .agents/skills — frontmatter that drives selection, the two-tier layout (SKILL.md is the always-on rule index, references/*.md hold sub-task deep dives opening with their trigger, the ~15 KB budget as a signal to separate topics rather than a number to shave prose under, trigger-named index lines, and repointing every pointer a split breaks), when a skill earns a mermaid diagram (an ordered cycle with a gate, never a rule list), one owner per topic, capturing session learnings into skills in the same session (and empirically verifying + fixing stale skill claims instead of obeying them), don't restate what an enforcer already checks, the reproducible-pattern test (one-offs are deleted rather than recorded — git already holds them), generic placeholders over identifiers from one change, magnitudes over incident numbers, and citing a docs page by its repo-relative path rather than a relative or GitHub link. Apply when creating, editing, splitting, merging, or reviewing any SKILL.md, when a session discovers or corrects a convention, or when deciding which skill a new rule belongs in.
---

# Skill Authoring

How to write and maintain a `.agents/skills/*/SKILL.md`. The ownership map of which skill owns what lives in `.agents/skills/README.md`; this skill owns how any one skill is written.

## Frontmatter drives selection

The `description` is the **only** thing read when deciding whether to load a skill — the body is invisible until it's selected. So it must be an accurate index of the body, not a slogan.

- **Enumerate the body's actual rules**, comma-separated, using the terms someone would think in (`method-signature-style exceptions`, `prefer-named-capture-group`), then close with an `Apply when …` clause naming the concrete trigger (file glob, task type, symbol).
- **Never advertise a rule the body doesn't contain**, and never omit the body's most consequential rule. A description that drifts from the body is worse than none: it wins selection and then fails to deliver, or loses selection and the rule never lands.
- **Re-read the description whenever you edit the body.** Adding, deleting, or moving a section is a description change too — a deleted rule that survives in the description is a fossil that keeps mis-triggering the skill.
- Model new skills on `responsive` and `oxlint` — both keep a tight rule list plus a specific `Apply when` trigger.

## One owner per topic

A rule lives in exactly **one** skill. Other skills reference it with a one-line pointer (`See the `formatting` skill`), never a paraphrase — a copy drifts, and two half-statements of a rule are harder to follow than one whole one.

- When a rule could fit two skills, it belongs to the **most specific** owner.
- A skill that finds itself explaining another skill's topic to set up its own point should link and move on.
- **A pointer earns its place only when it saves real duplication.** Don't redirect to a section the reader reaches by reading on, and don't replace a self-sufficient one-liner with a "see X" link.
- If a rule fits **no** skill, that's a missing skill — create one rather than overloading an unrelated one. Check `.agents/skills/README.md` first.

## Capture session learnings here, not in private memory

When a session discovers or corrects a convention — a shared primitive that must be reused instead of hand-rolled, a lifecycle rule behind a bug class, a claim in an existing skill that turned out to be stale — it lands in the owning skill **in the same session**, not in an assistant's private memory or the conversation. Skills are the compounding layer: they are what every future session, model, and background agent loads; a lesson recorded anywhere else dies with the session that learned it.

- Adding a section is also a frontmatter edit — the `description` must gain the new topic or selection never surfaces it.
- **A skill claim contradicted by evidence gets verified empirically and fixed, never obeyed.** Run the enforcer, reproduce the behavior, then correct the line — a stale rule that keeps being followed compounds exactly like a good one.

## Don't restate what an enforcer already checks

A rule mechanically enforced by typecheck, an ESLint/oxlint rule, `no-restricted-syntax`, a formatter, or a test **is owned by that enforcer** — it fails the build on violation, so prose re-deriving it is dead weight that rots when the rule changes.

When a convention is enforced, the note is **one line**: state it, give the non-obvious _why_ or the fix the error message can't, and point at the enforcer (rule name / file). Don't enumerate every banned form, paste the error text, or re-explain what the rule already says.

Reserve full prose for conventions with **no** enforcer — naming, structure, when-to-use-X, architectural intent. Those are exactly what skills exist to capture.

## Is it a reproducible pattern? If not, it does not belong here

Before writing anything down, ask whether a reader would apply it **again, to different code**. A skill holds repeatable patterns; git holds what happened.

- **Reproducible** — a rule that fires on a whole class of situations ("a token embedded in authored content is matched on its opening delimiter"). Write it, generically.
- **A one-off** — the specific thing that went wrong once, the file it went wrong in, the fix that was applied. Do **not** write it down at all, and delete it when found. It is not "context worth preserving": the commit, its message and its diff already hold it, in more detail and with a date attached, and a one-off in a skill is read as a standing rule by everyone after you.

The failure mode is subtle because a one-off _feels_ like hard-won knowledge. The test is not "was this expensive to learn" but "will the next reader be in this situation". A war story that generalises should be rewritten as its rule and the story dropped; a war story that doesn't generalise should just go.

This is also why a rule with a live example beats a rule with a historical one: an example lifted from a past change decays into a claim about code that has since moved, which is how a skill starts asserting things that are no longer true.

## Generic placeholders, never identifiers from one change

Code examples use `Foo`/`Bar`/`baz`, `external-pkg`, `@/models/Bar`. **Never paste the concrete identifiers, function names, package names, or file paths from the change that prompted the note** — a skill is a reusable convention, not a changelog, and task-specific names make the rule read as a one-off that doesn't generalise.

Generic source categories (`#shared`, `@vueuse/*`, `@/`) are fine — they describe a class of import, not a specific symbol. A concrete path is fine when the path **is** the rule (a registry file every consumer must edit).

The same applies to numbers: keep only the magnitudes the rule operates on (a limit, a budget), and drop the evidence numbers from the incident that prompted it — PR numbers, dates, counts from one occurrence, quoted error text with baked-in values. If the operative number may drift, state where to re-check it rather than freezing today's reading.

## SKILL.md is the always-on layer; `references/` holds the rest

A selected skill loads **whole**, so every byte of `SKILL.md` is paid for by every task that trips its trigger — including the tasks that needed one rule from it. The budget is **~15 KB, and ~150 lines**: bytes are what the context actually costs, lines are the readability proxy, and this repo's long prose lines make it easy to pass the first while meeting the second. Past that a skill stops being a rule list and becomes a manual nobody reads to the end, which is the same failure as not writing it.

So a skill is two tiers:

- **`SKILL.md`** — the rules that apply to _every_ task in the domain, one line each, plus an index of the deep dives. This is what has to land without anyone asking for it.
- **`references/<topic>.md`** — a rule set that fires only for a _named sub-task_: a ritual, a file type, a single component, a procedure. It is read when the index line matches, the way `code-review` reads its mode pages.

Move a section out when it is a **procedure** (ordered steps run occasionally), when it fires only for one narrow sub-task, or when it runs past ~40 lines of examples. Keep it in `SKILL.md` when violating it is the **default behaviour** — a rule that fires only if someone thought to look it up does not fire.

**The index line carries the split**, and it works like frontmatter: name the trigger, not the topic — as `testing` indexes `references/timers-and-hand-resolved-promises.md` _when a test installs fake timers or holds a call in flight_. An index line that reads "see X for more detail" guarantees the page is never opened.

**The budget is a signal, never a target.** Passing it says the skill has accumulated topics, and the fix is separating them — never shaving prose to land under the number, which buys bytes by making every surviving rule harder to read. Three cohesive pages beat nine fragments, and two rules that have to be read together stay on one page. Where a section over the line turns out to be another skill's subject, it **moves to that skill** rather than becoming a reference page here: one owner beats two shallow copies, and the split is the moment that shows up.

**A reference page opens by naming its trigger.** Its first line is "read when X" — a reader landing on the page from a search rather than from `SKILL.md` has nothing else to tell them whether the page is theirs. **Where `SKILL.md` kept part of the rule, a second line says which part**: "the rule itself is in `SKILL.md`; this page is Y". Without it the reader cannot tell whether they are holding the whole rule or its tail, and the always-on half gets restated here the next time someone edits the page. A page that holds its whole subject needs only the trigger, and adding the second line there invents a split that does not exist.

**A split breaks inbound pointers, so fix them in the same change.** Other skills cite sections by heading (``see the `pinia` skill ("Cursor Pagination in Stores")``), and a heading that moved into `references/` leaves that citation pointing at nothing — silently, because nothing resolves skill links. After moving a section, grep the tree for its heading text and repoint each citation at the page (``see the `pinia` skill (`references/keyed-state-and-pagination.md`)``), which is stable across later edits to the heading itself. Two pointer forms break **inside** the moved text as well: a `references/x.md` citation is now a sibling of that page and becomes bare `x.md`, and a cross-page "see below"/"as above" no longer has its target — both resolve to nothing and neither fails a build.

## Cite a page by its repo path, never by a link

Nothing resolves a link out of a skill: no renderer opens one, and a relative `../../../` hop or a
`github.com/.../blob/main/...` url is a path the reader has to reconstruct or a network fetch they cannot make.
So a citation is the **repo-relative path in backticks** — `packages/app/content/docs/architecture/foo.md` — which
is what a reader greps, opens and edits, and which stays right when the skill moves. A path relative to anything
but the repo root (`docs/architecture/foo.md`) resolves nowhere and is the form that silently rots.

Cite another **skill** by name plus its page (``the `pinia` skill (`references/keyed-state-and-pagination.md`)``),
never as a path into `.agents/skills/`.

## A cycle earns a diagram; a rule list does not

Most skills are rule lists, and a diagram of a list is decoration. The exception is a skill whose subject is an **ordered process with state** — a gate you can be on the wrong side of, a loop whose position decides what you may do next. Prose describes each step of one of those correctly and still leaves the reader unable to answer "where am I, and what does that permit", because that answer lives in the ordering rather than in any step.

One `mermaid` block, in `SKILL.md` beside the rule it serves, when all three hold:

- The subject is a **sequence or cycle**, not a set of independent rules.
- Being at the wrong point in it is a **mistake you can actually make** — the diagram is a gate, not an illustration.
- The nodes are states or decisions, not the rules restated as boxes.

Keep it small enough to read at a glance, label the edges with the condition that takes you along them, and never let it carry a rule the prose does not — a diagram is unsearchable, and a rule that exists only in one is a rule nobody greps. Content docs have their own, stricter diagram mandate, owned by the `docs` skill; this is the narrower rule for skills.

## Tight, not fluffy

One line per rule where possible. Cut redundant prose and example values that will rot. A skill is read under context pressure — every line competes with the code the reader actually needs.

Long-form prose is the tell. A rule needs its _why_ only where the why is non-obvious and load-bearing; a paragraph re-arguing a rule already stated is the part to cut, and a worked example earns its place only when the prose form is ambiguous without it.

## Skills vs `~/.claude/rules/*.md`

Repo skills and the user's global rules are **two trees that can contradict each other**, and the reader has no way to tell which wins. See `.agents/skills/README.md` ("Skills vs global rules") for the precedence rule and the current split.
