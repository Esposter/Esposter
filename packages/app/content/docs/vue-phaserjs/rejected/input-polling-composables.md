---
title: Input polling composables
description: Rejected — usePointer/useGamepad reactive input state.
---

# `usePointer()` / `useGamepad()`

Composables exposing pointer/gamepad state as reactive refs.

**Why not:** polling reactive refs every frame adds Vue reactivity overhead with no benefit over reading `scene.input.activePointer` or the gamepad directly in an `onUpdate` handler.
