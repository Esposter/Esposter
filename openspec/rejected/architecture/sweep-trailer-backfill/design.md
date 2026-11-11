# Sweep trailer backfill

A ledger-only commit carrying a `Ledger:` trailer for each unit of `.agents/ledgers/genshin-spec-evidence.md` whose sweep commit carried none, or a coverage script that dates a unit from the newest commit changing it.

## Why not

The gap it was written to close did not exist when it was weighed. Every row of the ledger was dated, with none open, because the later passes landed their own trailers and the coverage step dated the rows from them. The two remedies it weighed each cost something for nothing:

- **The backfill commit** writes the backfill's date and model against rows a different pass read, which is a wrong date in the one column the ledger exists to keep right.
- **Dating from history** makes a commit that touched a file count as a read of it, which is the inference the trailer rule exists to refuse (`.agents/skills/sweeps/references/one-pass.md`).

A sweep that lands without its trailer in future needs no remedy either: its row stays open, and the next pass reads the unit again and dates it from its own trailer, which is how the twenty rows of the unmarked pass were dated. The cost is a second read of a small page, and no row ever carries a date nobody earned.
