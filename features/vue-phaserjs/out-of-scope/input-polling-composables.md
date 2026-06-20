# `usePointer()` / `useGamepad()`

Composables exposing pointer/gamepad state as reactive refs.

## Why not

- Polling reactive refs every frame adds Vue reactivity overhead with no benefit over reading `scene.input.activePointer` / the gamepad directly in an `onUpdate` handler.
