---
title: Streamed tRPC content saves
description: Rejected — sending a large resource document through tRPC as FormData or a binary stream instead of one JSON body.
---

# Streamed tRPC Content Saves

tRPC accepts inputs that are not JSON — `FormData`, `File`, `Blob` and raw binary through `octetInputParser` — and the client's split link already routes such inputs through the non-batching `httpLink`. So a large document could be sent as a stream rather than as one JSON body.

## Why not

- **The whole document is parsed anyway.** `saveResourceContent` validates the complete document with the type's content schema before it writes anything, and the after-save hooks read the parsed shape. JSON cannot be validated as it streams, so the server buffers the full document whichever way it arrived. Streaming moves the buffering; it removes none of it.
- **A stream carries nothing beside it.** `octetInputParser` makes the input the stream alone, so the resource id and `contentVersion` a save needs have nowhere to go. [File uploads](/docs/architecture/file-uploads) already turned binary tRPC bodies down for this reason.
- **The browser only streams over HTTP/2.** Chrome sends a streaming request body only over HTTP/2 or later, with `duplex: "half"`, and refuses it over HTTP/1.1, the protocol a plain local dev server speaks. A buffered `Blob` avoids that restriction, but it carries a `content-length` and meets the same request size limiter as JSON does.

A [staged content save](/docs/architecture/file-uploads) uploads a large document to Blob Storage and gives tRPC only a reference.

## Sources

- [Non-JSON content types](https://trpc.io/docs/server/non-json-content-types) (tRPC) — `octetInputParser` hands the procedure a `ReadableStream`, and only `httpLink` carries non-JSON inputs.
- [Streaming requests with the fetch API](https://developer.chrome.com/docs/capabilities/web-apis/fetch-streaming-requests) (Chrome for Developers) — streaming request bodies need `duplex: "half"` and fail over HTTP/1.x.
