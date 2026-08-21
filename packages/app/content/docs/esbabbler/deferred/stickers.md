---
title: Stickers
description: Deferred — per-room sticker uploads sent as their own message.
---

# Stickers

Per-room uploaded stickers: a large image sent **as** a message, picked from a tray beside the emoji picker, the way Discord and Slack both do it.

**Why deferred**

- A sticker is not a glyph. It has no reaction path, no `:` autocomplete, and no inline render inside text, so it shares almost nothing with [custom emoji](/docs/esbabbler/custom-emoji) beyond the upload — it is a new message type, with its own render component, its own per-item weight in the message list, and its own picker surface.
- The emoji work answers the storage and permission questions first (a room-owned blob prefix, a count cap, a manage permission), so building stickers before it means answering them twice.

**Revisit when:** rooms want a bigger, standalone image than an inline glyph — at which point the sticker set reuses the emoji table's shape, cap and permission, and the only new work is the message type.
