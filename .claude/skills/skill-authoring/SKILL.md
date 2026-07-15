---
name: skill-authoring
description: Esposter skill-writing conventions for .claude/skills — frontmatter that drives selection, one owner per topic, don't restate what an enforcer already checks, generic placeholders over identifiers from one change, and declaration layout. Apply when creating, editing, splitting, merging, or reviewing any SKILL.md, or when deciding which skill a new rule belongs in.
---

# Skill Authoring

How to write and maintain a `.claude/skills/*/SKILL.md`. The ownership map of which skill owns what lives in `.claude/skills/README.md`; this skill owns how any one skill is written.

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
- If a rule fits **no** skill, that's a missing skill — create one rather than overloading an unrelated one. Check `.claude/skills/README.md` first.

## Don't restate what an enforcer already checks

A rule mechanically enforced by typecheck, an ESLint/oxlint rule, `no-restricted-syntax`, a formatter, or a test **is owned by that enforcer** — it fails the build on violation, so prose re-deriving it is dead weight that rots when the rule changes.

When a convention is enforced, the note is **one line**: state it, give the non-obvious _why_ or the fix the error message can't, and point at the enforcer (rule name / file). Don't enumerate every banned form, paste the error text, or re-explain what the rule already says.

Reserve full prose for conventions with **no** enforcer — naming, structure, when-to-use-X, architectural intent. Those are exactly what skills exist to capture.

## Generic placeholders, never identifiers from one change

Code examples use `Foo`/`Bar`/`baz`, `external-pkg`, `@/models/Bar`. **Never paste the concrete identifiers, function names, package names, or file paths from the change that prompted the note** — a skill is a reusable convention, not a changelog, and task-specific names make the rule read as a one-off that doesn't generalise.

Generic source categories (`#shared`, `@vueuse/*`, `@/`) are fine — they describe a class of import, not a specific symbol. A concrete path is fine when the path **is** the rule (a registry file every consumer must edit).

## Declaration layout

- **Interfaces/types at the top** — within a `.vue` `<script setup>` or `.ts` module, group all local `interface`/`type` declarations together at the top of the block (after imports), before the runtime `const`/logic. Don't interleave a stray interface between logic blocks.

## Tight, not fluffy

One line per rule where possible. Cut redundant prose and example values that will rot. A skill is read under context pressure — every line competes with the code the reader actually needs.

## Skills vs `~/.claude/rules/*.md`

Repo skills and the user's global rules are **two trees that can contradict each other**, and the reader has no way to tell which wins. See `.claude/skills/README.md` ("Skills vs global rules") for the precedence rule and the current split.
