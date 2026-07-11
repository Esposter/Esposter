---
title: useSound
description: Rejected — a composable for playing sounds.
---

# `useSound()`

A composable for playing sounds.

**Why not:** sound is managed via service functions (`getDungeonsSound`, `getDungeonsSoundEffect`) that pass `scene` explicitly; a composable would create a competing pattern without replacing any existing call site.
