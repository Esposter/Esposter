# `useSound()`

A composable for playing sounds.

## Why not

- Sound is managed via service functions (`getDungeonsSound`, `getDungeonsSoundEffect`) that pass `scene` explicitly.
- A composable approach would create a competing pattern without replacing any existing call site.
