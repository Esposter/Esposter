---
title: Multiple cameras
description: Rejected — a Vue abstraction for managing multiple cameras.
---

# Multiple Cameras

A Vue abstraction for managing multiple cameras.

**Why not:** cameras aren't game objects; their setup is one-time imperative configuration already doable via `@complete` on `<Scene>`, and no meaningful Vue component hierarchy maps to camera ownership.
