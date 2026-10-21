# Passing game text to a screen

Read when a screen shows a word and takes `gameText`, or a `genshin-interface` piece needs its words.

The one-line rule is in `SKILL.md`; this page is its reasoning.

A `genshin-interface` piece has no `genshin-text` dependency, so it takes its words already resolved, as labels, coloured runs (`TextSegment`) or a slot, from the `genshin-world` screen around it that holds `gameText`.
