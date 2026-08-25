---
name: runtime-efficiency
description: Esposter runtime efficiency — where work is placed and how it is shaped so it stays cheap: resolve a fact once at the consumer rather than at every producer, keep derivable work off the request path someone is waiting on, order an index by the lookup it has to serve rather than by the constraint it was written for, one statement per set instead of one per element, overlap independent reads and say why a sequence is load-bearing, reject cheapest-first, and bound a table's growth on the write path that already holds its keys. Apply when adding a query, an index, a fan-out, a background handler, or a table nothing deletes from — and when reviewing one.
---

# Runtime Efficiency

Where work is placed decides its cost far more than how it is written. These are the placement rules; **which `pnpm` script measures it is `package-scripts`, writing the benchmark itself is `bench`, and how the session spends its own turns is `context-efficiency`.** Query and column mechanics belong to `drizzle` and `azure-table` — this skill only decides what runs, where, and how often.

## Resolve a fact once, at the consumer

A fact several producers would each compute belongs to the single consumer that acts on it. Every producer computing it separately is the same query run N times, N chances to disagree, and N places to fix when the rule changes.

The tell is a producer asking a question whose answer it does not use — "is there anyone to notify?", "does this still exist?" — purely to decide whether to hand the work on. Hand it on unconditionally and let the consumer, which has to ask anyway, be the only one that asks.

## Keep derivable work off the request path

Anything a background handler can derive from ids it already holds does not belong in the mutation someone is waiting on. A display name, an avatar, a per-scope override, a rendered string — carry the id, resolve at the far end.

This is not the same as doing less work: the same query runs, just where nobody is blocked on it. It also collapses the copies — three producers that each resolved the same display name become one resolver.

## An index is ordered by the lookup it must serve

A composite index or unique constraint answers a prefix of its own column order and nothing else. One written for the constraint it enforces (`(endpoint, userId)` — "is this endpoint already registered") does not serve the read the system actually makes (`WHERE userId IN (…)`), and that read silently becomes a scan of the whole table.

Order the columns by the hottest lookup and let the constraint ride along, rather than adding a second index that duplicates it. Where a read is always `WHERE key = ? ORDER BY time DESC LIMIT n`, put the ordering column in the index too so a page is a range scan instead of a scan plus a sort.

## One statement per set, never one per element

A fan-out that writes a row per recipient is one `INSERT … VALUES (…), (…)`, not a loop. The same holds for the delete that trims it and the update that flips a flag across a set. A round trip per element is the cost that grows with the thing you are least in control of.

## Independent reads overlap; a sequence must justify itself

Two reads where neither feeds the other run in `Promise.all`. Two writes where the second reads what the first wrote run in sequence — and the comment says which one that is, because the next person's instinct is to parallelise it.

The dangerous case is a sequence that looks independent: rows written for one purpose that a later step reads for another. Order those explicitly and say so at the call site.

## Reject cheapest-first

The check that can drop the work using nothing already in hand runs before the queries. A payload that renders to nothing, an empty id set, a flag that says this type never reaches this surface — each of those ends the call before it costs anything, and every one of them placed after a query is that query wasted on work that was never going to happen.

## Bound growth where the keys already are

A table nothing deletes from grows forever. The trim belongs on the write path, which already holds the keys it would scope to — one indexed delete beside the insert — rather than in a sweep that has to rediscover them and gets scheduled, monitored and forgotten separately.

State the bound as a named duration or count constant, never a literal at the call site.
