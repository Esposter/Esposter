# Frontmatter

Read when writing a new skill's `description`, or editing the body of an existing one — every section added, deleted or moved is a description edit too.

The `description` is the **only** thing read when deciding whether to load a skill — the body is invisible until it's selected. So it must be an accurate index of the body, not a slogan.

- **Enumerate the body's actual rules**, comma-separated, using the terms someone would think in (`method-signature-style exceptions`, `prefer-named-capture-group`), then close with an `Apply when …` clause naming the concrete trigger (file glob, task type, symbol).
- **Never advertise a rule the body doesn't contain**, and never omit the body's most consequential rule. A description that drifts from the body is worse than none: it wins selection and then fails to deliver, or loses selection and the rule never lands.
- **Re-read the description whenever you edit the body.** Adding, deleting, or moving a section is a description change too — a deleted rule that survives in the description is a fossil that keeps mis-triggering the skill.
- Model new skills on `responsive` and `oxlint` — both keep a tight rule list plus a specific `Apply when` trigger.
