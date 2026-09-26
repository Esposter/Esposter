---
title: Raised request body limit
description: Rejected — letting large resource content through by raising the security module's request size limit, globally or on the tRPC route.
---

# Raised Request Body Limit

The quickest way to let a large document save would be to raise `maxRequestSizeInBytes` in `configuration/security.ts`, or to override it with a route rule on the tRPC endpoint, until the document fits in one request.

## Why not

- **Every procedure inherits it.** The tRPC endpoint is one route, so a per-route override is still a raise for every procedure behind it. Any authenticated caller could then send bodies of that size to procedures that were never meant to parse them.
- **The server stays in the data path.** Each large autosave would stream the whole document through the app server on the owner's connection. Blob Storage accepts that upload directly, and the SAS flow the app already uses for attachments is built for exactly that.
- **It ties a product ceiling to a transport one.** How large a document a resource may hold is its own constant, `MAX_RESOURCE_CONTENT_SIZE`, taken from the reference product. A request limit raised until documents fit would make the two one number again, and every later change to either would move the other.
- **The number stops having a source.** `MAX_REQUEST_SIZE` is the security module's documented default. A raised value is a number picked because one file needed it.

A [staged content save](/docs/architecture/file-uploads) keeps the limit and sends a large body to Blob Storage by reference instead.
