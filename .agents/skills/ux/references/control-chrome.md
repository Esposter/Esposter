# Control Chrome

Read when a bar shares its space between standing controls and a transient value (a hover preview, a selection count), or when a field shows a value that is always read inside fixed punctuation (a shortcode's colons, a handle's `@`, a unit). This page holds both rules whole; `SKILL.md` keeps one line each.

## A transient value may take a bar, but never resize it

A hover preview, a selection count, a live validation hint — all of them come and go with the pointer. Sharing one
bar with the standing controls is the reference products' own shape and reads well, because the two are never wanted
at the same moment: while the pointer is over the grid the reader is reading the preview, not aiming at a button.
What is not allowed is the bar changing size as it swaps, or the standing controls failing to come back the instant
the transient value goes — a control that has to be hunted for again after a hover is a control that moved.

So: state the bar's height on the bar, put one thing in it at a time, and make the empty state of the transient
value the standing state rather than a gap where it was.

**Prime example — the emoji picker footer.** The hovered emoji fills the bar with its glyph and shortcode; with no
hover the same bar holds `Add Emoji` and the skin-tone control. The height is declared once on the container, so
which of the two is showing moves nothing.

## Punctuation a value is written with is chrome, not input

When a value is always read inside fixed punctuation — a shortcode's colons, a handle's `@`, a unit — the field
shows it and the model never carries it: a `prefix`/`suffix` on the input, with the same characters stripped from
anything typed or pasted so a value copied from elsewhere still lands. Asking for it instead means a field that
rejects what its own placeholder invited, and a value shown without it does not read as the thing the user will
type later.

**The punctuation has to touch the value, and a `suffix` alone does not.** Vuetify puts the prefix and suffix
either side of the input, but the input takes the whole remaining row, so the closing character lands at the far
edge of the box with a gap where the token should be — which reads as two pieces of chrome rather than one token.
Let the input size to its own content (`field-sizing: content`, with the `size` attribute as the character count
underneath it) and the pair closes around the value. Without that the whole device is pointless: the reason to
draw the punctuation is that `:name:` reads as the thing that will be typed, and spaced to the margins it does
not.

**Prime example — the emoji name field.** The name's charset is lowercase letters, digits and underscores, so a
typed colon could only ever be an error; the field draws `:name:` with the colons fixed either side and stores the
name alone. One field serves the create dialog and the settings rename, so the rules and the chrome cannot
disagree between them.
