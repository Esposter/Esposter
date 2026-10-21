# Game data reads

Read when a function reads a table, a word, a fitted scene or an authored world file.

The one-line rule is in `SKILL.md`; this page is its reasoning.

A table, a word, a fitted scene or an authored world file is read by its key from the hosted game data, awaited at a boundary and handed down to the functions over it (the `genshin-data` skill).
