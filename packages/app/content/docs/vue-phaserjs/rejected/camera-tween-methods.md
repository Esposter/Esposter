---
title: Camera tween helpers
description: Rejected — flash/shake/pan/zoom/rotate camera wrapper helpers.
---

# Camera Tween Helpers

Wrapper helpers for camera flash/shake/pan/zoom/rotate effects (`flashCamera` / `shakeCamera` / `panCamera` / `zoomCamera` / `rotateTo`).

**Why not:** not used anywhere in the codebase; a wrapper is only worth adding when a real call site needs one. Until then, call the Phaser camera API directly.
