# `useTimeline()`

A composable for chaining tweens into a timeline.

## Why not

- Direct `scene.tweens.chain()` in `onComplete` is sufficient; timeline chaining is app-specific and doesn't benefit from a library abstraction.
