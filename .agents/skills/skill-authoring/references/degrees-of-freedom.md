# Degrees of freedom

Read when writing a step into a skill, or reading one that prescribes how a thing is done rather than what must come out of it.

**How tightly a line prescribes matches how fragile the thing it governs is**, and the test for any one line is what breaks if the reader does it differently:

- **Nothing breaks** — the line is cut. A step a capable reader takes anyway (read the file first, check the result, consider the edge cases) costs every load and steers nothing; a list of them makes the output worse, because the reader follows the list instead of the task in front of it.
- **The result is worse, and many routes reach a good one** — state the goal and what a good result holds, never the route. A review, a design, a refactor and a piece of prose are judged work: the skill owns the bar and the reader owns the path.
- **One shape is wanted and its contents vary** — give the shape itself: the table with its columns, the trailer with its fields, the opening words. A shape is also what a check can decide (`references/enforceable-shapes.md`).
- **A wrong move is expensive or cannot be undone** — a migration, a push to a shared ref, a delete — the step is a script, run and never retyped (`references/embedded-recipes.md`). Prose asking for exactness is the weakest way to get it.

One skill holds every level at once, each line at its own: the prose of a commit message is the reader's, its trailer is a shape, and the push behind it is a command.

**An ordered list is for an order that matters** — a gate that must pass before the next step, a step that sends the reader back when its check fails. Independent rules numbered into steps claim a sequence they do not have, and the reader runs them in it.

**A line written to hold an older model in place is a finding.** Emphasis in capitals, a rule said twice, a step spelled out because a weaker reader skipped it: each is read against the test above by the pass that meets it, and goes when nothing breaks without it. The newer model reopening a skill's row is what brings that read around (`references/skill-coverage.md`).
