---
title: Upload content validation
description: Deferred — inspecting an uploaded file's bytes server-side instead of trusting the content type the client declared for them.
---

# Upload Content Validation

Reading an uploaded file's actual bytes on the server — a magic-number check, an image decode, or a virus scan — and storing only what the check passes, rather than accepting whatever the client PUT to the write target it was given.

Nothing of the sort runs on any upload path. Every upload in the app follows one shape: the server validates the declared size and mime type, mints a short-lived write SAS scoped to a single derived blob name, and the client PUTs the file directly to Azure Blob. Attachments, room profile images, resource assets and [custom emoji](/docs/esbabbler/custom-emoji) all work this way, and none of them ever holds the bytes.

## Why deferred

- The direct-to-blob upload is the reason nothing inspects the bytes, and it is the same property that makes the app's uploads cheap: the file never transits a server process, so there is nowhere a check can sit today. Adding one means either proxying the upload, with the request size limits, memory and timeout budget that implies, or landing it quarantined and scanning it before anything may read it. The second keeps the direct upload, and costs a state a blob can be in that no read path currently knows about — every reader would have to learn to refuse an unscanned blob, which is the same reach as the first option wearing different clothes.
- What the bytes could do is bounded by what serves them, though not uniformly. Attachments, resource assets and room emoji are reachable only through a short-lived signed url, and where the response type matters that url is signed with the type the server chose rather than the one the upload set. **Profile images are the exception** — room and user images are written into `PublicUserAssets` and handed back as the blob's own unsigned url, so what bounds those is the container being read-only to the world, not a signature. Nothing on the origin executes any of them, and every surface renders one as an `<img>`, a media element or a document viewer. The realistic exposure is a decoder bug in the reader's own browser.
- Every upload path has the same gap, so the check belongs in one shared mechanism or nowhere. Adding it per feature produces the worst version: some paths validated, no way to tell which, and a claim of safety that only holds where somebody remembered.

## Revisit when

The app accepts uploads from people who are not already trusted members of the room or workspace they are uploading into — a public form, an anonymous surface, or a shared drop — or a stored file starts being served to third parties outside a signed url. Either turns the decoder-bug exposure into somebody else's problem, which is when a single validating path earns its cost.

## Cheaper interim

Keep the two properties that already bound it: a write SAS is minted for exactly one derived blob name, and only once the declared size and mime type have been checked, and everything outside the public image container is read back through a short-lived url the server signs. Neither is a constraint on the bytes — a write SAS cannot be one — which is exactly what makes them cheap. Neither costs a request hop, and both hold for every upload path without anybody remembering.
