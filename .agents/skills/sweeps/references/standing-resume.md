# Resuming a standing sweep

Read when picking a sweep back up, or when writing or widening a ledger's `Scope`. `SKILL.md` holds why every
sweep is standing; this page holds how one resumes.

## The command

A pass resumes from what changed since the row's date rather than re-reading the unit, over the pathspecs the
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

## Scope is the convention's domain, not the union of the rows

Declaring only what already has a row makes the command agree with the ledger by construction, which is the one
thing it must not do — a tree the convention reaches that no unit names is the gap worth surfacing, and scoped to
the domain it comes back as work on the first resume rather than staying invisible until someone happens to look.

That is also why `Scope` lives on the index row and never inside the ledger file: a resume reads the index to
find which files to run against, so a scope stored past that point cannot be reached without opening the thing it
was meant to locate.

A pathspec that resolves to nothing is `SKILL.md`'s silent scan wearing a different hat — it reports no work and
reads exactly like a swept tree, and nothing else would notice, because a scope is prose to every other tool. So
`scripts/src/workspace/ledgerScopes.test.ts` holds every pathspec in the index to something that exists, and holds every ledger
to declaring one.
