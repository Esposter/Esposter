# Sample Fixer

Read when fixing the units a sample sitting's readers left, the units `pnpm ai:sweep:record --fixer` writes: refuting a finding first, the outcome each finding takes, the cells a reader left unread, and the commits and trailers the fixes go out as.

## Input

A JSON file of units, each `{ "unit": …, "judgements": [...] }`: one unit and its judgements that were not clean, one per question. Each judgement carries the reader's verdict, the files it read and its findings. A reader's finding is a lead, not a fact.

## For each unit

1. Load the owning skill of each question on the unit: the index `.agents/ledgers/README.md` names it in the `Rules` cell.
2. Refute each finding first. Ask what would have to be true for the code to be right, grep `openspec/` and `.agents/skills` for a recorded decision, and look for a comment beside the line. Refute a finding that:
   - an enforcer already owns (lint, typecheck, an existing test);
   - argues against a recorded decision;
   - rests on recall rather than the repository.
3. Fix each finding that survives, in the worktree:
   - a `tidy` is behaviour-preserving only;
   - a `defect` is fixed in its behaviour. Add one regression test only where it fails honestly without the fix (`testing` skill, "What to Test"), and prove it by reverting the fix once and restoring it (`testing` skill, `references/regression-proof.md`);
   - a finding that shows the rule is stale, or contradicts code that is right, is fixed in the skill or spec that owns the rule, and its outcome is `skill`.
4. **Unread cells.** A judgement with the verdict `unread` was never read. Read that question's in-scope files in the unit in full first: the unit's files by the grammar in `references/sample-reader.md`, its scope from the question's `Scope` cell, its rules from the ledger and the owning skill. What you find becomes your own findings, fixed the same way, and the cell's `Ledger:` trailer waits until you have read it whole.
5. Commit each unit by pathspec as its own commit, `fix(<scope>): …` or `refactor(<scope>): …`, carrying:
   - one `Ledger: <question> | <unit>` trailer per question judged on the unit, the unit spelled exactly as in the input;
   - the co-author trailer of the model that did the work (`git` skill).

   A unit whose findings were all refuted still gets its trailers: they ride the next commit, or a trailer-only `git commit --allow-empty` record commit (`references/one-pass.md`).

6. Before landing, typecheck every package whose types or templates you changed, with its own typecheck script, and build a workspace package whose barrel you changed (`pnpm -C <package> build`); without that build the land precheck fails with "missing export". Format and lint the touched files and run only the touched tests (`running-checks` skill).
7. Land with `pnpm ai:land` every three to five commits, and remove the worktree once everything has landed (`review-queue` skill).

## Output

One JSON line per finding, in the result file beside the unit file, `<n>.result.jsonl` in the fixers' directory:

```json
{"unit":"…","ledger":"…","kind":"defect|tidy","file":"…","line":<n>,"outcome":"fixed|refuted|skill|open","reason":"<one sentence>","commit":"<sha or empty>"}
```

- `fixed`: the finding was fixed in the code.
- `refuted`: the finding was wrong, and the reason says what settles it.
- `skill`: the rule that owns the code was fixed instead of the code.
- `open`: the finding holds, but its fix needs a change this pass cannot make (a dataset publish, a backfill, a design decision); the reason names it, and the lead takes it up.

A defect counts toward its question's sample unless its outcome is `refuted`, since a defect left open is a defect found, so be exact. The sampled count reads these lines and refuses any other outcome, naming the line.

The final reply is one line: `fixer <id>: units <n>, fixed <a>, refuted <b>, skill <c>, open <e>, commits <d>, landed yes|no`. Every finding is counted in exactly one of `fixed`, `refuted`, `skill` or `open`, so the counts sum to the findings in the units.
