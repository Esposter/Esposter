---
title: Raised request body limit
description: Rejected — letting large resource content through by raising the security module's request size limit, globally or on the tRPC route.
---

# Raised Request Body Limit

The quickest way to let a large document save would be to raise `maxRequestSizeInBytes` in `configuration/security.ts`, or to override it with a route rule on the tRPC endpoint, until the document fits in one request.

## Why not

- **Every procedure inherits it.** The tRPC endpoint is one route, so a per-route override is still a raise for every procedure behind it. Any authenticated caller could then send bodies of that size to procedures that were never meant to parse them.
- **The server stays in the data path.** Each large autosave would stream the whole document through the app server on the owner's connection. Blob Storage accepts that upload directly, and the SAS flow the app already uses for attachments is built for exactly that.
- **It moves a product ceiling by accident.** Every content schema's free-form strings and lists take `MAX_RESOURCE_CONTENT_LENGTH`, which is defined from the request limit. Raising one silently raises the other.
- **The number stops having a source.** The limit is meant to be the security module's documented default of 2,000,000 bytes; today's 2 MiB is a near-miss of it that the proposal corrects. A raised value is a number picked because one file needed it.

[Large content saves](/docs/proposals/resource/large-content-saves) keeps the limit and sends large bodies to Blob Storage by reference instead.
