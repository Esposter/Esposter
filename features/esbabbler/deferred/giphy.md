# `/giphy [query]`

Slash command that fetches and sends a GIF via the Giphy free tier; a Tiptap extension triggers a picker on `/`.

## Why deferred

- Requires Giphy API registration and an external runtime dependency; not purely code-based.

## Revisit when

We are willing to take on an external API dependency (key management, rate limits, terms) for GIF search.
