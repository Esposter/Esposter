# Session Learnings

Read when a session has discovered or corrected a convention, or found a skill claim the evidence contradicts. The rule itself is in `SKILL.md`; this page is what counts and what the edit owes.

When a session discovers or corrects a convention — a shared primitive that must be reused instead of hand-rolled, a lifecycle rule behind a bug class, a claim in an existing skill that turned out to be stale — it lands in the owning skill **in the same session**, not in an assistant's private memory or the conversation. Skills are the compounding layer: they are what every future session, model, and background agent loads; a lesson recorded anywhere else dies with the session that learned it.

- A learning that changes what the skill is for — its trigger or its domain — is also a frontmatter edit (`references/frontmatter.md`).
- **A skill claim contradicted by evidence gets verified empirically and fixed, never obeyed.** Run the enforcer, reproduce the behavior, then correct the line — a stale rule that keeps being followed compounds exactly like a good one.
