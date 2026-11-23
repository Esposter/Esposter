# The Blocklist

Read when two spellings of one utility both work, or a spelling is being blocked.

`presetWind4` accepts an alias for most of what it generates — `pa-4` beside `p-4`, `border-2` beside `b-2`,
`rounded-lg` beside `rd-lg`, `fw-bold` beside `font-bold`, `color-white` beside `text-white` — so the same style
can be written several ways across the tree. **`BLOCKED_SPELLINGS` in `uno.config.ts` is the single source of
truth for which spelling is canonical**: each entry refuses one alias family and names what to write instead.
The generator honours it by emitting nothing for a blocked token, and the blocklist (a selector list in `vite/services/blockedSpellingSyntaxes.ts`, run by vize over the app's templates) reports the attribute or `class` literal that wrote one, with the message. A string inside a `:class`
expression is out of the rule's reach, so `apps/web/app/templates.test.ts` checks those against the same list. A new alias found in the tree
joins the list rather than the prose.
