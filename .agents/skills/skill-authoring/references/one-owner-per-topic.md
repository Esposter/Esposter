# One Owner per Topic

Read when a rule could live in two skills, when a skill is about to explain another skill's topic, when a pointer is being written, or when a repo skill and an installed plugin skill meet. The rule itself is in `SKILL.md`; this page is how the owner is chosen and how the other side points at it.

A rule lives in exactly **one** skill. Other skills reference it with a one-line pointer (``See the `formatting` skill``), never a paraphrase — a copy drifts, and two half-statements of a rule are harder to follow than one whole one. `pnpm ai:sweep:duplicate-prose` lists every run of ten words two skills or docs pages of different owners share, longest first: a copy shares sentences, a pointer never does, and a paraphrase is what the pass reads for.

- When a rule could fit two skills, it belongs to the **most specific** owner.
- A skill that finds itself explaining another skill's topic to set up its own point should link and move on.
- **A pointer earns its place only when it saves real duplication.** Don't redirect to a section the reader reaches by reading on, and don't replace a self-sufficient one-liner with a "see X" link.
- If a rule fits **no** skill, that's a missing skill — create one rather than overloading an unrelated one. Read the descriptions first.
- **Installed plugin skills are in the same namespace, and a repo skill outranks one wherever their subjects meet.** A plugin ships general practice; a repo skill states what this repo actually does, so it wins — but only if it says so, because a model picking between two descriptions has nothing else to go on. The repo skill names the plugin one in its own exclusion list rather than trusting the general one to defer, and a plugin skill covering a subject no repo skill owns is left alone. The collision that matters most is a shared **name**: two skills called `code-review` are one wrong pick away from a review that never ran the workflow.
