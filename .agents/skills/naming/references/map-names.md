# Map Names

Read when naming a map, a record or a function that looks one up. The one-line rule is in `SKILL.md`; this page is its full statement and where lint stops.

- **A map or record is `<key><value>Map`, never `<value>By<key>` or `<key>To<value>`** — the key's word first, then the value's (`rowIdIndexMap`, `slugEmojiMap`); the value's word alone where the key is a field the value already carries (`userMap`); a qualifier in front of the whole (`newFooBarMap`). The order is the repo's PascalCase lookup tables' (`EmojiGroupIconMap` is group → icon). A **function** keeps its `By<Selector>` — it names what it takes. `no-restricted-syntax` decides all of that from what the name is attached to; the one shape left to a reader is an untyped `To` literal, where `usersToRooms` is a join table's own name.
