# Frontmatter

Read when writing a new skill's `description`, or when a body edit changes what the skill is for — a new trigger, a domain it no longer covers.

The `description` is the **only** thing read when deciding whether to load a skill — the body is invisible until it's selected — and Claude Code shows a fixed prefix of it in the listing and nothing past that (the cap is `MAX_DESCRIPTION_CHARACTERS` in `scripts/src/services/sweeps/skillDocs/constants.ts`, and `pnpm ai:sweep:skill-docs` reports a description over it). So a description is three things in a fixed order, and `ai:sweep:skill-docs` holds the first:

1. **The trigger, as the opening: `Apply when …`.** The concrete situation — a file glob, a task type, a symbol — in the terms someone would think in. It goes first because a truncated listing keeps the front, and a trigger cut off is a skill that never loads.
2. **The domain, in a sentence.** What the skill is the owner of, so a reader choosing between two skills can tell them apart.
3. **The rules that decide selection**, comma-separated, only where the domain sentence would not have surfaced them — a rule name (`prefer-named-capture-group`), a primitive (`useMutation`), a Settled direction a reader would otherwise propose.

What a description is **not** is an index of the body. The headings already are one, the body loads whole once selected, and a description that restates every section is edited on every section edit — which is how a description came to advertise a rule the body no longer held and to hide its trigger past the cap.

- **Never advertise a rule the body doesn't contain**, and never omit the one a reader would select the skill for. A description that drifts from the body wins selection and then fails to deliver, or loses selection and the rule never lands.
- **A body edit that changes the trigger or the domain is a description edit.** One that adds or moves a section is not.
- `when_to_use` is not used here: it is appended to the description in the listing and counts against the same cap, so anything it would say belongs in the trigger.
- Model a new skill on `responsive` and `git` — a trigger, a domain, a short rule list.
