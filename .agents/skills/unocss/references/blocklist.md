# The Blocklist

Read when two spellings of one utility both work, or a spelling is being blocked.

`presetWind4` accepts an alias for most of what it generates — `pa-4` beside `p-4`, `border-2` beside `b-2`,
`rounded-lg` beside `rd-lg`, `fw-bold` beside `font-bold`, `color-white` beside `text-white` — so the same style
can be written several ways across the tree. **`BLOCKED_SPELLINGS` in `uno.config.ts` is the single source of
truth for which spelling is canonical**: each entry refuses one alias family and names what to write instead.
The generator honours it by emitting nothing for a blocked token, and `unocss/blocklist` (on in the shared ESLint
config) reports the attribute or `class` literal that wrote one, with the message. A string inside a `:class`
expression is out of the rule's reach, so `app/templates.test.ts` checks those against the same list. A new alias found in the tree
joins the list rather than the prose.

**Blocking a spelling is a render change, so it owes `pnpm test app/App.test.ts -u --run`.** The attribute
survives into the rendered markup, and the committed HTML under `apps/web/app/__snapshots__/` is the only place
that still holds the old one — no linter reads a snapshot, so the rewrite of the components passes every check
and the suite goes red on a file the change never touched. It has landed that way twice, once per blocked
family, which is why it is a step here rather than a thing to notice.
