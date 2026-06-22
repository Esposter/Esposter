# Multiple Cameras

A Vue abstraction for managing multiple cameras.

## Why not

- Cameras aren't game objects; setup is one-time imperative config already doable via `onComplete` on `<Scene>`.
- No meaningful Vue component hierarchy maps to camera ownership.
