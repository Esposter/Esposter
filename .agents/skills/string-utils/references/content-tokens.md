# Tokens in Authored Content

Read before writing or widening a regex that finds something inside content a user authored — a blob url, a `{{variable}}`, an alias.

Before writing or widening any regex that finds something inside content a user authored (a blob url, a `{{variable}}`, a blueprint alias), read `apps/web/content/docs/architecture/content-token-rewriting.md` — it is canonical. The four rules that are broken:

- **Never define the match as a negated charset** (`[^"'()<>\s\\]*`) — "everything except the delimiters I thought of" is a guess at a set that is never closed. Either the token carries its own delimiters (`{{…}}`), or anchor the match on the delimiter that opened it via lookbehind, so each context permits the characters the others reserve. An opener the content escapes (an html-escaped quote) is still an opener, and a position with no recognised opener falls back to the conservative body — a fallback reachable from **any** position, never from an enumerated set of preceding characters, which silently matches nothing after every character the list forgets.
- **Walk the parsed value's string leaves, never regex its serialized form** — use `deepReplaceStrings` (`#shared/util/object/deepReplaceStrings`) rather than matching over `JSON.stringify(content)`, which makes the matcher read the serializer's escaping on top of the content's own.
- **One pass keyed by a `Map`, never a per-token regex loop** over the whole document — a loop lets a token consume a longer token it is a prefix of, and scales cost with tokens × content size.
- **Widen the reader, don't backfill**, when a token's canonical form changes: content is rewritten on every read, so it converges on its own.
