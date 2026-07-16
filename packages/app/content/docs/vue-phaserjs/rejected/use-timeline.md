---
title: useTimeline
description: Rejected — a composable for chaining tweens into a timeline.
---

# `useTimeline()`

A composable for chaining tweens into a timeline.

**Why not:** direct `scene.tweens.chain()` in `@complete` is sufficient; timeline chaining is app-specific and doesn't benefit from a library abstraction.
