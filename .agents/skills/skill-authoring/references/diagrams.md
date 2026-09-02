# Diagrams in a skill

Read when adding, reviewing or removing a `mermaid` block in a `SKILL.md`. This page holds the whole rule; `SKILL.md` keeps only the index line.

Most skills are rule lists, and a diagram of a list is decoration. The exception is a skill whose subject is an **ordered process with state** — a gate you can be on the wrong side of, a loop whose position decides what you may do next. Prose describes each step of one of those correctly and still leaves the reader unable to answer "where am I, and what does that permit", because that answer lives in the ordering rather than in any step.

One `mermaid` block, in `SKILL.md` beside the rule it serves, when all three hold:

- The subject is a **sequence or cycle**, not a set of independent rules.
- Being at the wrong point in it is a **mistake you can actually make** — the diagram is a gate, not an illustration.
- The nodes are states or decisions, not the rules restated as boxes.

Keep it small enough to read at a glance, label the edges with the condition that takes you along them, and never let it carry a rule the prose does not — a diagram is unsearchable, and a rule that exists only in one is a rule nobody greps.

Content docs have their own, stricter diagram mandate, owned by the `docs` skill; this is the narrower rule for skills.
