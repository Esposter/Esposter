---
name: skill-authoring
description: Esposter skill-writing conventions for .agents/skills — a Settled list of the directions already rejected (shaving prose to land under the size budget, giving another skill's subject a reference page here, recording a one-off as context worth preserving, restating what an enforcer checks, citing a page as a markdown link, diagramming a rule list, and keeping a learning in private memory), frontmatter that drives selection, the two-tier layout (SKILL.md is the always-on rule index, references/*.md hold sub-task deep dives opening with their trigger, the ~15 KB budget as a signal to separate topics rather than a number to shave prose under, trigger-named index lines, and repointing every pointer a split breaks), when a skill earns a mermaid diagram (an ordered cycle with a gate, never a rule list), one owner per topic, capturing session learnings into skills in the same session (and empirically verifying + fixing stale skill claims instead of obeying them), the `## Settled — do not re-propose` list a domain with rejected directions carries as its first section so a settled decision is findable before it is re-derived rather than buried in prose, don't restate what an enforcer already checks, the reproducible-pattern test (one-offs are deleted rather than recorded — git already holds them), generic placeholders over identifiers from one change, magnitudes over incident numbers, stating the rule rather than the roster it produced (a count, an enumeration of what currently satisfies a convention or an only-X-does-this claim restates what ls/grep/a manifest answers, and a sweep's swept set belongs in its ledger while the rule it carried is written as an invariant plus its enforcer), and citing a docs page by its repo-relative path rather than a relative or GitHub link. Apply when creating, editing, splitting, merging, or reviewing any SKILL.md, when a session discovers or corrects a convention, or when deciding which skill a new rule belongs in.
---

# Skill Authoring

How to write and maintain a `.agents/skills/*/SKILL.md`. The ownership map of which skill owns what lives in `.agents/skills/README.md`; this skill owns how any one skill is written.

## Settled — do not re-propose

- **Shaving prose to bring a skill under the ~15 KB budget.** The budget is a signal that topics have accumulated, and cutting words buys bytes by making every surviving rule harder to read; separate the topics instead ("SKILL.md is the always-on layer").
- **Moving an over-budget section to a `references/` page here when it is another skill's subject.** It becomes two shallow copies of one topic; it moves to the skill that owns it (`references/splitting-a-skill.md`).
- **Recording a one-off as context worth preserving** — the file it went wrong in, the fix that was applied. The commit already holds it with more detail and a date, and a one-off in a skill reads as a standing rule ("Is it a reproducible pattern?").
- **Restating a rule an enforcer already checks**, for completeness. It fails the build on violation, so the prose only rots when the rule changes ("Don't restate what an enforcer already checks").
- **Citing a page as a markdown link** — a relative hop or a `github.com/.../blob/...` url. Nothing resolves a link out of a skill; the repo-relative path in backticks is what a reader greps ("Cite a page by its repo path").
- **A diagram to make a rule list scannable.** A diagram of a list is decoration; only an ordered cycle with a gate earns one (`references/diagrams.md`).
- **Keeping a session's learning in private memory or the conversation** rather than the owning skill. It dies with the session that learned it ("Capture session learnings here").

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
- **Installed plugin skills are in the same namespace, and a repo skill outranks one wherever their subjects meet.** A plugin ships general practice; a repo skill states what this repo actually does, so it wins — but only if it says so, because a model picking between two descriptions has nothing else to go on. The repo skill names the plugin one in its own exclusion list rather than trusting the general one to defer, and a plugin skill covering a subject no repo skill owns is left alone. The collision that matters most is a shared **name**: two skills called `code-review` are one wrong pick away from a review that never ran the workflow.

## Capture session learnings here, not in private memory

When a session discovers or corrects a convention — a shared primitive that must be reused instead of hand-rolled, a lifecycle rule behind a bug class, a claim in an existing skill that turned out to be stale — it lands in the owning skill **in the same session**, not in an assistant's private memory or the conversation. Skills are the compounding layer: they are what every future session, model, and background agent loads; a lesson recorded anywhere else dies with the session that learned it.

- Adding a section is also a frontmatter edit — the `description` must gain the new topic or selection never surfaces it.
- **A skill claim contradicted by evidence gets verified empirically and fixed, never obeyed.** Run the enforcer, reproduce the behavior, then correct the line — a stale rule that keeps being followed compounds exactly like a good one.

## Rejected directions get a list, not a paragraph

A settled decision written as prose — "finishing X has been tried and is not wanted", mid-paragraph, two thirds down a long skill — is not read by the person about to propose X. That is how a rejected design gets re-derived by a reader who loaded the very skill that rejects it, and the cost is a session's work thrown away against a record that existed and was unfindable.

So a skill whose domain has directions that were tried or considered and rejected carries **`## Settled — do not re-propose`** as its first section after the intro, ahead of the rules anyone designs against.

- **One line per direction**: what would be proposed, why it fails, what to do instead — `**Bundling `` `external-pkg` `` into every consumer** — duplicates it in each dist and splits its types, so `` `instanceof` `` fails across copies; externalise and let the consumer dedupe.`
- **It holds directions, not rules.** A rule says what to do. A settled line exists only because a reader would plausibly propose the alternative — if nobody would, it is a rule and belongs with the rules.
- **The rationale stays where it already lives.** The line carries one clause of why, never the argument: where the skill makes the case further down, or `packages/app/content/docs/architecture/rejected/` holds a page for it, the line ends with that pointer. Two full statements of one rejection drift like any other copy.
- The reproducible-pattern test applies unchanged: no dates, no PR numbers, no account of the session that got it wrong. What would be proposed and why it fails is the whole entry.

`code-review` greps this tree as the tiebreaker for a finding that argues with a decision, so a rejection that never reaches a `Settled` list is one that keeps being re-litigated.

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

## State the rule, never the roster it produced

The `docs` skill owns this in full ("Never write down what the repo can count", "Magnitudes, not
measurements") and it binds a skill exactly as it binds a page. A count, an enumeration of what currently
satisfies a convention, or an "only X does this" is a second copy of what `ls`, `grep` or a manifest answers,
and it rots without failing anything — the reader who finds one more case than the skill admits cannot tell
whether the skill is stale or the code is wrong. Write the convention that **generates** the set and name where
the set lives; a list earns its place only where every row carries something the tree cannot — a scope, a role,
a caveat.

**A sweep is where this gets broken**, because a pass ends with the swept set freshly in mind and writing it
down reads as completion: "every package now declares X", the roster that opted out, the count reached. It is a
snapshot the next package invalidates, and it is the wrong layer twice over — progress belongs to the sweep's
ledger (the `sweeps` skill), and the rule belongs here as an **invariant plus its enforcer**. What keeps "every
package declares X" true is the test that fails when one does not; the sentence claiming it can only ever go
quietly out of date.

## An exception has to name what forces it

We own the whole codebase, so almost nothing is genuinely un-fixable: a rule that would be inconvenient to apply
is a rule to apply anyway, and an exception written for it is a permanent licence bought to save one commit. The
bar is that something **outside our control** forces the shape — a dependency's own spelling or interface, a
platform or language requirement, a published surface whose rename is a breaking change, an enforcer that
demands the opposite. Those are worth writing down precisely because no amount of editing our code removes them.

So an exception states its forcing agent by name (`@azure/storage-blob`'s `listBlobsFlat`, `MediaRecorder`'s
optional properties, `vitest/padding-around-test-blocks`). One that cannot name a source outside the repo is
either a rule branch wearing the wrong word — `flex-wrap` on a three-control row is _when the rule says yes_,
not an escape from it — or a defect the exception is hiding, and the fix is the code. The second kind reads
plausibly — a carve-out for "a case the rule cannot express" — so the tell is a grep rather than an argument:
where neighbouring code already spells the thing the rule’s way and is fine, the exception is describing one
site’s defect, and deleting it costs a rename.

**Prefer the branch to the carve-out.** Written as a branch the rule stays one rule and its edge is decidable;
written as an exception it becomes two rules, and the second grows.

## SKILL.md is the always-on layer; `references/` holds the rest

A selected skill loads **whole**, so every byte of `SKILL.md` is paid for by every task that trips its trigger — including the tasks that needed one rule from it. The budget is **~15 KB, and ~150 lines**: bytes are what the context actually costs, lines are the readability proxy, and this repo's long prose lines make it easy to pass the first while meeting the second. Past that a skill stops being a rule list and becomes a manual nobody reads to the end, which is the same failure as not writing it.

So a skill is two tiers:

- **`SKILL.md`** — the rules that apply to _every_ task in the domain, one line each, plus an index of the deep dives. This is what has to land without anyone asking for it.
- **`references/<topic>.md`** — a rule set that fires only for a _named sub-task_: a ritual, a file type, a single component, a procedure. It is read when the index line matches, the way `code-review` reads its mode pages.

**The index line carries the split**, and it works like frontmatter: name the trigger, not the topic — as `testing` indexes `references/timers-and-hand-resolved-promises.md` _when a test installs fake timers or holds a call in flight_. An index line that reads "see X for more detail" guarantees the page is never opened.

**The budget is a signal, never a target.** Passing it says the skill has accumulated topics, and the fix is separating them — never shaving prose to land under the number, which buys bytes by making every surviving rule harder to read. Three cohesive pages beat nine fragments, and two rules that have to be read together stay on one page.

**Actually moving a section out — `references/splitting-a-skill.md`.** What qualifies, what a reference page's
opening lines owe a reader who arrived by search, and the pointer forms a move silently breaks, is that page.

## Cite a page by its repo path, never by a link

Nothing resolves a link out of a skill: no renderer opens one, and a relative `../../../` hop or a
`github.com/.../blob/main/...` url is a path the reader has to reconstruct or a network fetch they cannot make.
So a citation is the **repo-relative path in backticks** — `packages/app/content/docs/architecture/foo.md` — which
is what a reader greps, opens and edits, and which stays right when the skill moves. A path relative to anything
but the repo root (`docs/architecture/foo.md`) resolves nowhere and is the form that silently rots.

Cite another **skill** by name plus its page (``the `pinia` skill (`references/keyed-state-and-pagination.md`)``),
never as a path into `.agents/skills/`.

## A cycle earns a diagram — `references/diagrams.md`

Most skills are rule lists, and a diagram of a list is decoration. **Considering a `mermaid` block in a skill** — the three conditions its subject has to meet, and why an ordered process with a gate is the only subject that meets them — is that page.

## Tight, not fluffy

One line per rule where possible. Cut redundant prose and example values that will rot. A skill is read under context pressure — every line competes with the code the reader actually needs.

Long-form prose is the tell. A rule needs its _why_ only where the why is non-obvious and load-bearing; a paragraph re-arguing a rule already stated is the part to cut, and a worked example earns its place only when the prose form is ambiguous without it.

## Skills vs `~/.claude/rules/*.md`

Repo skills and the user's global rules are **two trees that can contradict each other**, and the reader has no way to tell which wins. See `.agents/skills/README.md` ("Skills vs global rules") for the precedence rule and the current split.
