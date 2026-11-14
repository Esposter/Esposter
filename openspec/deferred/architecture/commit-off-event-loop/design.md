# Commit off the event loop

A staged or delta save ends with the web Worker inflating, parsing and validating the whole document before it writes it ([large documents](../../../specs/architecture/large-documents/design.md)). The inflation streams through a `DecompressionStream`, so it yields between chunks, but the JSON parse and the schema validation after it are synchronous. Those hold the web Worker's isolate for a time that grows with the document, from a fraction of a second at a few megabytes to seconds at `MAX_RESOURCE_CONTENT_SIZE`. Every other request that isolate serves waits it out. The benches beside `apps/web/server/services/resource/readStagedResourceContent.ts` record the cost.

A Worker has no worker thread to hand the parse to: `node:worker_threads` is a stub that does not run on Workers. The only places to run the work off the isolate are another Worker or a Durable Object, and the one that fits is a queue consumer on the functions Worker, which would read the staged R2 object by its key and commit it.

## Why deferred

- **The cost is bounded, and paid only near the ceiling.** A save only takes this path above one request body, and the long pauses are confined to documents near the content limit. Reads do not pay it at all: a large document is downloaded straight from R2 through a presigned read URL.
- **A queue consumer would relocate the whole save, not one step.** The commit shares its version check, transaction, storage ledger charge, revision and save event with every other door into `saveResourceContent`. Moving the parse alone would ship the document back to the web Worker; moving the save moves all of those, and adds an asynchronous "saved" notification the browser has to wait on.

## Revisit when

An instance's request latency shows stalls that line up with large saves, or large documents become common enough that their commits overlap other traffic regularly. Either makes moving the commit worth the asynchronous notification. Before it is built, a ceiling commit's parse has to be measured inside a Worker's memory limit, since that decides whether the consumer can hold the document at all.

## Cheaper interim

Lowering `MAX_RESOURCE_CONTENT_SIZE` bounds the pause directly, since it scales with the document, and is a one-constant change.

## Sources

- [Workers limits](https://developers.cloudflare.com/workers/platform/limits/) — 128 MB per isolate, the JavaScript heap and WebAssembly allocations together.
- [Workers Node.js compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/) — `node:worker_threads` is listed as a non-functional stub.
