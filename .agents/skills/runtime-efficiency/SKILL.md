---
name: runtime-efficiency
description: Apply when adding a query, an index, a fan-out, a background handler, or a table nothing deletes from, when a payload can outgrow one request body, when a tooling script or sweep feels slow, and when reviewing any of them. Esposter's runtime efficiency — where work is placed and how it is shaped so it stays cheap.
---

# Runtime Efficiency

Where work is placed decides its cost far more than how it is written. These are the placement rules; **which `pnpm` script measures it is `package-scripts`, writing the benchmark itself is `bench`, and how the session spends its own turns is `context-efficiency`.** Query and column mechanics belong to `drizzle` — this skill only decides what runs, where, and how often.

## Settled — do not re-propose

- **A scheduled sweep that trims a table nothing deletes from.** It has to rediscover keys the write already holds, and it runs on a schedule nothing watches; the trim is one indexed delete on the write path (`Bound growth where the keys already are`, this file).
- **Routing a large document's bytes through the server.** Past one request body they move through a presigned URL the server signs, and the server holds them only to validate or compute (`openspec/specs/architecture/large-documents/design.md`).

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

`no-await-in-loop` holds this: a loop that awaits is converted or carries the shape it keeps as its directive's reason. **Converting one, or naming why it stays sequential**, is `references/sequential-loops.md`.

## Reject cheapest-first

The check that can drop the work using nothing already in hand runs before the queries. A payload that renders to nothing, an empty id set, a flag that says this type never reaches this surface — each of those ends the call before it costs anything, and every one of them placed after a query is that query wasted on work that was never going to happen.

## Build a library's fixed setup once, not on every call

A convenience call that takes its configuration as an argument often rebuilds everything that configuration implies before it does the work: a schema from a list of extensions, a renderer's mapping from each extension's output spec, a pattern compiled from a fixed string. When the configuration never changes, that setup is the same on every call, and in a loop it is most of the cost — the page builder's text render spent nearly all of its time rebuilding TipTap's schema and mappings once per node (`openspec/specs/resource/note-resource/design.md`, "Published view"). Build the fixed part once at module scope from the library's exported pieces, and pass the call only what varies. A profile finds it: time the call against its setup alone before rewriting anything.

## Count without allocating

A size is counted, never measured by building the thing and reading its length. A text's UTF-8 byte length is `getUtf8ByteLength` (`@esposter/shared`), which encodes into one scratch buffer kept for every call; `encode(text).byteLength` allocates every byte to count them, which a per-cell size paid fifty thousand times in one row insert. Lint reports the encode-to-count shape, and an encode whose bytes are used — a hash, a signature, a body — stays.

Bytes already held are read through a view, never copied out of their buffer: `new Float32Array(x.buffer, x.byteOffset, x.byteLength / Float32Array.BYTES_PER_ELEMENT)` reads the same floats as `.buffer.slice(x.byteOffset, …)`, which `restrictedSourceSyntaxes` bans. A copy stays only where an offset the element size does not divide needs one, and it says so.

## Bound what an outside host can send

A body fetched from the wiki's file host is read through `readWikiFile` (`genshin-persona`), the one reader that refuses a body past `WIKI_FILE_MAX_BYTES` and answers nothing for it. Every other read of an outside body goes through `readBoundedBody` (`genshin-persona`), the one bounded read, which a caller reaches only with a ceiling it names: `readWikiJson` (the plugin's wiki API reads), and in the scripts `fetchOk`, which returns the bytes and never the response, so a caller cannot read the body unbounded. `fetchJson`, `readWikiApi` and `fetchRegistry` are built on `fetchOk`, and `readBoundedResponse` is the same read for a caller that keeps a response (the Cloudflare reply). A plugin script that cannot import the reader (`sinsScript`, since a plugin reaches only its own files) carries a counting read of the same shape against a ceiling it names. A new read of an outside body goes through one of these, rather than a `.arrayBuffer()` or `.json()` of the response.

Our own R2 objects and the lock-pinned game data are trusted, so their readers need no bound. In the scripts those are `readPublishedGameDataObject`, `readPublishedGameDataObjectIfStored` and `downloadObjectTo`, which read through `fetchResponse` (the raw request) and the R2 client's `get`; the packages' readers of R2 and the published data (`genshin-world`, `packages/db`) are trusted by the same rule. The Cloudflare API and the local parity dev server are not in that class, since the rule names R2 objects and lock-pinned data and neither is one, so both are bounded (`CLOUDFLARE_API_MAX_BYTES`, `PARITY_PAGE_MAX_BYTES`). Each ceiling is named for its source, and where a size was measured it sits past the largest one measured.

## A script's clock is boot, spawns and reads

Measure a script end to end first (`scripts/src/workspace/sweepCommands.bench.md`); what its time is made of, and the timeout a whole-tree suite needs, is in `references/script-clock.md`.

## The server never carries what it does not interpret

Past one request body (`MAX_REQUEST_SIZE`), a document moves between the browser and R2 through a presigned URL the server signs, in both directions; the server holds it only to validate a write or to compute from it. And a write that changes nothing must serialize to the same bytes — an import or rebuild that mints fresh ids or timestamps carries the previous ones over, or every content-addressed copy pays for the document again. Both rules, and the pieces a new large blob composes, are `openspec/specs/architecture/large-documents/design.md`.

A JSON document stored in R2 is never a plain upload: it is written by `writeJsonBlob` and read by `readJsonBlob` (`@esposter/db`), a zstd frame served with `Content-Encoding: zstd`, so a change to that path reaches every document at once (`openspec/specs/architecture/compressed-json-blobs/design.md`).

## Bound growth where the keys already are

A table nothing deletes from grows forever. The trim belongs on the write path, which already holds the keys it would scope to — one indexed delete beside the insert — rather than in a sweep that has to rediscover them and gets scheduled, monitored and forgotten separately.

State the bound as a named duration or count constant, never a literal at the call site.

## A timer is the last resort

A timer or a polling loop is proposed only after three questions are answered no, in order: does the underlying service already emit an event for it, can the state be a predicate evaluated at read time, and can the cleanup ride a write path that already holds the rows. Only then is a scheduled job justified, and its design says why each answer was no.

## Reference pages

- `references/script-clock.md` — when a tooling script feels slow, or a whole-tree suite is added.
- `references/sequential-loops.md` — when `no-await-in-loop` reports, or a loop awaits.
