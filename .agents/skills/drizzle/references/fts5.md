# Message Search

Read when a table is searched by its text, or a search index changes. The one-line rule is in `SKILL.md`; this page is its full statement.

A room's messages are searched through `messages_search`, an FTS5 virtual table in the room's own SQLite, created by the room's migration that adds search (`apps/functions/src/durableObjects/room/migrations/`). It is in external-content mode, `content='messages', content_rowid='id'`: the index holds the terms and reads the text from `messages`, and its rowid is the message's integer `id`, so a search hit names the row.

- **Three triggers on `messages` keep the index in step**, created by the same migration as the table. An insert adds the row's terms, a delete writes the `'delete'` command with the row's old values, and an update of an indexed column does both. The index is written in the same statement as the message, so the two cannot drift.
- **The indexed columns are `message`, `filenames` and `senderName`.** `filenames` is a column the row carries, the space-joined file names written with the row, so the triggers stay plain SQL and read no other table (`apps/functions/src/durableObjects/room/schema.ts`, on `messagesInRoom`).
- **The tokenizer is `porter unicode61 remove_diacritics 2`**, set in the same `CREATE VIRTUAL TABLE`.
