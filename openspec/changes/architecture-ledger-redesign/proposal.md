# Ledger redesign

## Why

A sweep ledger says which units a settled question has reached. Every ledger stores that state as a `Swept` column, and `pnpm ai:sweep:ledger-coverage` rewrites the column from the `Ledger:` and `Reopens:` commit trailers at the start and end of every sitting. The column holds nothing the trailers do not, so the tables are a cache of `git log` kept in the tree. Every sitting rewrites files that every parallel agent is also writing.

The area-split questions make it grow as questions times units. `invariants`, `quality`, `security` and `write-once` each keep the same area files and the same units, and a test exists only to hold the copies equal. A fifth question would add another full copy.

The rules around a sitting also make a sweep cost more than it finds. A rule change reopens every unit of its ledger, even when its find recipe hits a handful. A clean unit's trailer has no commit to ride once nothing else in the sitting changes. And a question whose units come back clean, sample after sample, is still owed a full read of every unit.

## What changes

- Coverage is read from the trailers, never stored. `pnpm ai:sweep:status` prints every unit's date and model from the local clone's history, and every `Swept` column and the coverage rewrite go.
- One area list, `.agents/ledgers/areas/`, is read by every question that sweeps by area. A question keeps a file for an area only for the units it holds a note on.
- Every date the tables hold today is kept. A date no trailer records is carried by a dated trailer on a trailer-only record commit, and the status is checked to reproduce every cell before any table goes.
- A clean unit's trailer may ride a trailer-only record commit.
- A rule change reopens only the units its find recipe hits.
- A sitting may read a unit once and judge it against each question in turn.
- A question whose random sample comes back clean is marked sampled clean, and its unread units are owed again only on a reopen or a change to their code.

No behaviour of the app changes. This is a tooling and documentation change, so it carries no spec delta.

## Out of scope

- Reading any row. The row tasks of the [ledger refresh](../architecture-ledger-refresh/proposal.md) wait for this change, so no sweep is spent on a shape that is about to change.
- Moving a ledger's scope into its owning skill's `paths:` frontmatter, which the design rejects.
