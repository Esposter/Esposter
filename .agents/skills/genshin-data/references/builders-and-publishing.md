# Builders and publishing

Read when a dataset's builder is written, proven with `--dry-run`, or published.

The one-line rules are in `SKILL.md`; this page is their reasoning.

## Keys

A record the code names by itself gets its own key (`stats/weapons`), and a set read one entity at a time is an index by id (`profile/<Language>`).

## Proving a builder

A path `removed` across many rows is a field the source stopped writing, never new content, so it is fixed before the publish. A real publish needs `az login`, writes the lock only once both accounts hold every object, and the lock is committed at once with the publish's report in its body.
