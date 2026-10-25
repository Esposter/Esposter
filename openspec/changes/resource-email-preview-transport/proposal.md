# Email preview transport

## Why

Preview compiles the open email on the server through a query that carries the whole document in the request's URL. A realistic email is large enough that its encoded URL exceeds the server's request-header limit, so the server answers 431 (Request Header Fields Too Large) and Preview shows nothing. The same email is also re-sent on every debounced edit while the owner types, and the log shows the requests stacking up behind each other.

## What changes

- Preview sends the open email in a request body, so its size is not bounded by the URL.
- Preview compiles once per settled edit, not once per request the editor happens to issue.
- A long email previews as a short one does.

## Open question for the owner

There are two ways to make a large email reach the server. The change as written takes the first.

1. **Send the document in a request body (recommended).** The compile becomes a tRPC mutation, the standard transport for a large input: a GET carries its input in a URL that servers cap, and a body is not capped at that size. The compile stays a pure function of its input, so retrying it is safe, and the preview still shows an unsaved edit.
2. **Compile the saved copy on the server.** Preview would send no document at all and compile what autosave last stored. That removes the payload, but Preview would then lag the owner's edits by the autosave debounce and could not show an edit that is not yet saved, which the page's Preview requirement promises it does.

The design takes option 1. If the owner prefers option 2, the design and tasks are rewritten before this change is built.

## Out of scope

The canvas drawing ([resource-email-canvas-drawing](../archive/2026-10-25-resource-email-canvas-drawing/proposal.md)) and the frame's console and scroll behaviour ([resource-email-canvas-frame](../resource-email-canvas-frame/proposal.md)).
