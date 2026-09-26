---
title: Commit off the event loop
description: Deferred — running a large save's parse and validation in a worker thread or an Azure Function, so the web server's event loop never waits on it.
---

# Commit off the event loop

A staged or delta save ends with the server decompressing, parsing and validating the whole document before it writes it ([large documents](/docs/architecture/large-documents)). That work is synchronous, so it blocks the web server's event loop for a time that grows with the document, from a fraction of a second at a few megabytes to seconds at `MAX_RESOURCE_CONTENT_SIZE`. Every other request on that instance waits it out. The benches beside `apps/web/server/services/resource/readStagedResourceContent.ts` record the cost.

There are two ways to take it off the loop:

- A `node:worker_threads` worker that decompresses, parses, validates and re-serializes, handing back the bytes to store as a transferred buffer, their hash, and the few projections the save derives from the content.
- The existing Azure Function app, which would read the staged blob by name and commit it. A ceiling commit fits the Consumption plan's memory, and the monthly free grant covers many thousands of them.

## Why deferred

- **The cost is bounded, and paid only near the ceiling.** A save only takes this path above one request body, and the long pauses are confined to documents near the content limit. Reads no longer pay it at all: a large document is downloaded straight from Blob Storage.
- **A worker needs its own build entry.** The server has no worker thread today, so a worker file would be a module the app build has to emit beside the server bundle, locate at runtime and keep in step with the server's dependencies — standing maintenance for a pause that only near-ceiling documents cause.
- **A Function would relocate the whole save, not one step.** The commit shares its version check, transaction, storage ledger charge, revision and save event with every other door into `saveResourceContent`. Moving the parse alone would ship the document back to the web server; moving the save moves all of those, and adds an asynchronous "saved" notification the browser has to wait on.

## Revisit when

An instance's request latency shows stalls that line up with large saves, or large documents become common enough that their commits overlap other traffic regularly. Either makes the worker's build entry worth its maintenance, and it is the one to build first: it keeps the save synchronous and changes nothing outside the server.

## Cheaper interim

Lowering `MAX_RESOURCE_CONTENT_SIZE` bounds the pause directly, since it scales with the document, and is a one-constant change.
