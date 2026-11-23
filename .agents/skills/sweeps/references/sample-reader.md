# Sample Reader

Read when judging a batch as a read-only reader in a sample sitting: the unit grammar, one question at a time, refuting before reporting, and the output line. The loop a pass runs is `references/one-pass.md`; the sitting that hands the batch out is `references/windows-and-convergence.md`.

A reader is one agent over one batch file, which `pnpm ai:sweep:batch` cut from the sample. The caller names the batch file and the output file. The output sits beside the batch as `<n>.jsonl` beside `<n>.txt`, which is how `pnpm ai:sweep:record` finds both.

## Limits

- Read only. Never edit, create, move or delete a repository file, and never stage, commit, stash, reset, check out, install, or create a worktree.
- Run no test, typecheck, build or lint. A finding one of them would catch is not reported, since CI runs them.
- Write only your own output file, and launch no sub-agents.

## The batch

Each line is one unit and the questions it is judged for: `<unit> :: <question>, <question>…`. Take the lines in order. Resolve a unit's files once, then judge each of its questions in turn.

### Resolving the unit's files

The unit is written in the area list's grammar, with repository-rooted paths:

- `path`[, `path`…]: a file, or a directory's whole tracked tree;
- `dir` — `a`, `b`: those entries of `dir`;
- `dir` — the rest: the files under `dir` that no deeper unit names.

Each file belongs to the deepest path naming it. List the unit's files with `git ls-files -- <paths>`, and for "the rest" drop the files other units in `.agents/ledgers/areas/*.md` name more deeply. A unit spelled as an openspec folder (`openspec/…/<folder>`) means that folder's own `design.md`, `proposal.md`, `spec.md` and `tasks.md` only, not its sub-folders.

Skip generated output, which no question judges: `CHANGELOG.md`, migration `.sql` and snapshot `.json` files, lockfiles, `dist`, generated data files, and binaries (images, fonts, audio). A skipped file is neither read nor counted in `files`. A unit whose files are all skipped is `clean` with `files` 0.

### Judging each question

One question at a time, never a merged checklist.

1. **Scope.** The question's scope is its row's `Scope` cell in `.agents/ledgers/README.md`, read as git pathspecs. Its files in this unit are the unit's files that `git ls-files -- <scope>` also lists. Read every one of them in full.
2. **Rules.** The rules are the rules table in `.agents/ledgers/<question>.md` (or `.agents/ledgers/<question>/README.md` for a question kept in a folder), any note on this unit in `.agents/ledgers/<question>/<area>.md`, and the owning skill the index's `Rules` cell names. Load each skill once per batch. A judgement without its owning skill loaded is not one: load the skill before judging, or write an `unread` finding.
3. **Refute first.** A question's ledger may hold a find recipe: run it as written, and read it before refuting a finding that cites it. For each candidate finding, open the cited line and try to refute it. Grep `openspec/` and `.agents/skills` for a recorded decision, and look for a comment beside the line. Keep only what survives.
   A wrapped `//` comment line that opens on a capital letter is what the `capitalized-comments` lint rule requires (`formatting` skill, `references/capitalized-comments.md`), so it is never reported, whatever its words.
4. **Classify** what survives:
   - `defect`: behaviour is wrong, or a rule is broken with a real consequence: a bug, a data or security hole, a convention break that misleads, or prose the code contradicts.
   - `tidy`: a behaviour-preserving improvement the rule asks for, such as a rename, a tidier literal, a duplicated line or a comment shape.

The shell is zsh, which does not split an unquoted variable: `git grep -n PATTERN -- $FILES` passes the whole list as one path and silently matches nothing. Run a recipe under `bash -c '…'`, or pass the paths as separate arguments. A scan's empty result is trusted only once it has matched a known line (`SKILL.md`, "The find recipe").

## Output

Append one JSON line per (question, unit) to the output file as soon as it is judged:

```json
{"ledger":"<question>","unit":"<unit exactly as given>","files":<files read>,"findings":[{"kind":"defect|tidy|unread","file":"<path>","line":<n>,"what":"<one sentence>","fix":"<one sentence>"}]}
```

- `unit` is copied exactly as its batch line spells it, character for character. Never split a unit into files, shorten its list or re-spell it: the trailer that dates the cell has to match.
- `files` is the number of files read in full.
- `line` is the cited line, or 0 for a finding on no single line.
- A unit with no finding is `clean`: every in-scope file was read in full and nothing survived. Any finding sends the unit to a fixer, a `tidy` included.
- `unread` means the unit could not be read in full. Its finding has kind `unread`: `what` gives the reason and `fix` says how the unit would be read.

The final reply is one line: `batch <id>: <n> judgements, clean <a>, with findings <b>`.
