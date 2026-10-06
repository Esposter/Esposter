# A Character That Renders as Nothing

Read when a non-printing character is about to be written into a literal.

**A non-printing character is written as its `\uXXXX` escape, never the raw byte** — `RECORD_SEPARATOR = "\u001E"`,
never the character itself pasted between the quotes (`SKILL.md`, Settled).

Both compile to the same string and `oxfmt` keeps either, so it is decided everywhere that is not the compiler — a
raw byte renders as nothing in a diff, a terminal or an editor, so no reader can tell the pasted byte from an
empty string, from its neighbour one code point along, or from having been dropped by a tool that rewrote the line.

Where the same value has a second spelling in another realm (git's `%x1E` inside a `--format` string), both live in
one `constants.ts` block, because a drift between them reads as a parse that simply returns nothing.

`scripts/src/workspace/controlCharacters.test.ts` enforces it over every tracked file but a vendored skill's, because nothing else can see
the character: it is invisible in an editor, in a diff and in a review alike.
