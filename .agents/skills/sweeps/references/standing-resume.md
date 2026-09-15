# Resuming a standing sweep

Read when picking a sweep back up, or when writing or widening a ledger's `Scope`. `SKILL.md` holds why every
sweep is standing; this page holds how one resumes.

## The command

`pnpm ai:sweep:ledger-coverage` runs first, so the date the command takes is the one the trailers hold; a trailer it reports as naming no row is a unit reworded since its pass, and reopens at `—`. A pass then resumes from what changed since the row's date rather than re-reading the unit, over the pathspecs the
sweep's **`Scope`** declares in `.agents/ledgers/README.md`:

```bash
git log --since=<Last swept date> --name-only --pretty=format: -- '<pathspec>' '<pathspec>' | sort -u
```

Everything outside that list was swept at the last pass — skip it rather than re-reading it. A row still at `—`
has no date to resume from and is a first pass over the whole unit.

**Each pathspec is quoted, one argument each.** Git does its own matching, and a wildcard that reaches it
unquoted is expanded by the shell against the working directory first — which narrows the scope silently rather
than failing: `*README.md` unquoted becomes the single README at the repo root, so the `docs` sweep resumes over
one file and reports every other tree as clean.

## A resume set the size of the whole unit is a move, not churn

The command above reports a file as changed whenever a commit in the range touched its **path**, and a
repo-wide relocation touches every one of them. Under a pathspec the rename is not even visible as a rename:
`git log --name-status` limits itself to the new path, so the old half is outside the filter and every entry
comes back `A`. The tell is the shape of the answer — a resume that returns the unit's whole file list, when the
row was dated precisely because nothing much has happened there since.

So when a resume set is close to the unit's own size, find the commit before believing it:

```bash
git log --since=<Last swept date> --format="%h %s" -- '<pathspec>' | tail
git show --name-status --format= -M <suspect> | awk '{print substr($1,1,1)}' | sort | uniq -c
```

A commit whose status tally is `R` and nothing else changed no content, so it is not work for a content sweep.
Subtract its files and resume over the remainder:

```bash
git show --name-only --format= <move> | sort -u > moved
git log --since=<Last swept date> --name-only --pretty=format: -- '<pathspec>' | sort -u | comm -23 - moved
```

**The move also hides everything before it.** A pathspec on the new path matches no commit that touched the old
one, so a resume dated before a relocation reports only what changed after it — `apps/web/shared/models` since a
date before the workspace move answered a tenth of its real set until "packages/app/shared/models" was passed
beside it. Pass both paths for any window that straddles a move, and map the old prefix onto the new before dedupe.

Left unchecked this is the silent scan of `SKILL.md` inverted — rather than reporting nothing and reading as
clean, it reports everything and reads as a tree nobody can afford to sweep, which is how a row that is four
files of real work gets deferred as several sittings.

## Scope is the convention's domain, not the union of the rows

Declaring only what already has a row makes the command agree with the ledger by construction, which is the one
thing it must not do — a tree the convention reaches that no unit names is the gap worth surfacing.

**The scope alone does not surface it, though: the resume asks which files changed, and a tree nobody has touched
since the date changes nothing.** So an unnamed tree that is also quiet stays invisible for exactly as long as it
stays quiet, which is the case where nobody was going to look anyway. Reconciling is its own step, and it is
cheap — list the scope's own directories and read the rows beside them:

```bash
find <scope directory> -maxdepth 1
```

Anything the ledger does not name opens at `—`. One sitting on `quality/` found four: `app/models/message` and
`app/models/resource` had no row in any ledger, and `components/Resource`'s fourteen root files and five of its
directories had none in theirs — none of which any resume would have reported, because none of them had changed.

That is also why `Scope` lives on the index row and never inside the ledger file: a resume reads the index to
find which files to run against, so a scope stored past that point cannot be reached without opening the thing it
was meant to locate.

A pathspec that resolves to nothing is `SKILL.md`'s silent scan wearing a different hat — it reports no work and
reads exactly like a swept tree, and nothing else would notice, because a scope is prose to every other tool. So
`scripts/src/workspace/ledgerScopes.test.ts` holds every pathspec in the index to something that exists, and holds every ledger
to declaring one.

## A fully dated ledger is kept

A `—` in `Swept` is unswept, and **a fully dated ledger is kept, not deleted**: it is the index that answers "was this area swept, and when" in one read, which git can only answer by archaeology from someone who already knows what to look for. Those dates are also what the next convention change is scoped against. Add a coverage line rather than widening an existing one when a unit turns out too big, and split it into its own file when the lines stop fitting.
