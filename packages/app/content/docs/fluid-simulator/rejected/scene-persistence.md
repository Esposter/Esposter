---
title: Scene persistence
description: Saving the inspector's sky/water/bloom parameters per user.
---

# Scene Persistence

Persisting the inspector slider values (sun position, water distortion, bloom, clouds) per user via the blob-state pattern.

**Why not:** The sliders exist to poke at the renderer, not to author a scene anyone returns to — defaults are the intended view, and a save adds a procedure + schema for state with no ongoing value. The games' single-blob pattern stays reserved for actual progress.
