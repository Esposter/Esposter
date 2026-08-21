---
title: Upload content validation
description: Deferred — inspecting an uploaded file's bytes server-side instead of trusting the content type the client declared for them.
---

# Upload Content Validation

Reading an uploaded file's actual bytes on the server — a magic-number check, an image decode, or a virus scan — and storing only what the check passes, rather than accepting whatever the client PUT to the write target it was given.

Nothing of the sort runs on any upload path. Every upload in the app follows one shape: the server validates the declared size and mime type, mints a short-lived write SAS scoped to a single derived blob name, and the client PUTs the file directly to Azure Blob. Attachments, room profile images, resource assets and [custom emoji](/docs/esbabbler/custom-emoji) all work this way, and none of them ever holds the bytes.

## Why deferred

- The direct-to-blob upload is the reason nothing inspects the bytes, and it is the same property that makes the app's uploads cheap: the file never transits a server process, so there is no place to put a check that does not first undo the design. A validating upload is a proxied upload, with the request size limits, memory and timeout budget that implies.
- What the bytes could do is bounded by what serves them. A blob is reachable only through a short-lived read SAS — which, where the response type matters, is signed with the type the server chose rather than the one the upload set — nothing on the origin executes it, and every surface that renders one renders it as an `<img>` or a media element. The realistic exposure is a decoder bug in the reader's own browser.
- Every upload path has the same gap, so the check belongs in one shared mechanism or nowhere. Adding it per feature produces the worst version: some paths validated, no way to tell which, and a claim of safety that only holds where somebody remembered.

## Revisit when

The app accepts uploads from people who are not already trusted members of the room or workspace they are uploading into — a public form, an anonymous surface, or a shared drop — or a stored file starts being served to third parties outside a signed url. Either turns the decoder-bug exposure into somebody else's problem, which is when a single validating path earns its cost.

## Cheaper interim

Keep the two properties that already bound it: a write SAS is minted for exactly one derived blob name, and only once the declared size and mime type have been checked, and a blob is only ever reachable through a short-lived read SAS the server signs. Neither is a constraint on the bytes — a write SAS cannot be one — which is exactly what makes them cheap. Neither costs a request hop, and both hold for every upload path without anybody remembering.
