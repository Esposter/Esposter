# Control-flow Shapes

Read when writing or reshaping a branch — a guard, an `if/else`, or a chain. The rule itself is in `SKILL.md`
(guard clauses first, one guard per outcome, a chain from first branch to last); this page is where each shape
stops being right and what a reviewer's "use a guard clause" gets wrong.

- **Guard clauses first** — `if (!condition) return` to exit early instead of wrapping the body in `if`. Invert and
  return early aggressively.
- **One guard per outcome, not one per condition** — consecutive guards whose bodies are identical collapse into
  one with `||` wherever the conditions are independent. Splitting them reads as though the branches differ and
  invites a later edit to give one its own body, which is how two conditions that must stay in lockstep drift
  apart. Keep them split when the bodies genuinely differ (a distinct throw, a log, a different return value), or
  when the second condition depends on the first having passed or has side effects — `if (!a) return; if (a.b)
return;` throws once merged.
- **Do not convert balanced `if/else` into a guard clause** — guards are only correct when the remainder of the
  function is the single happy path. When two branches are parallel paths of similar weight, keep `if/else`;
  converting either duplicates shared steps or obscures mutual exclusivity. A reviewer suggesting "use a guard
  clause" is a false positive when the `else` branch contains substantial work.
- **Always use `if/else if/else`, from the first branch to the last** — no standalone `if` followed by `else if`,
  even when the first branch is a guard clause, and no trailing statement standing in for the final `else`. A
  fall-through `return` written at the chain's own indent _is_ the `else` branch with its keyword left off, and
  reads as code reached after the chain rather than instead of it: `if (!x) return a; else if (y) return b; else
return c;` — `no-else-return` is off for exactly this reason. Only omit the trailing `else` when the chain has no
  final branch, and only omit chaining altogether when the branches are genuinely independent (different concerns,
  not a logical chain).
- **The branch before the terminal `else` may not be negated** — `no-negated-condition` ignores a negated test
  whose alternate is another `if`, so `if (!x) … else if (!y) …` is only legal while the chain stays open; closing
  it with an `else` makes the last negated test an error. Invert that test and swap the final two branches
  (`else if (y) … else …`), which is what `--fix` does — it leaves the braces and one-line bodies for `oxfmt` and
  you to settle.
