# Multiple Cameras

A Vue abstraction for managing multiple cameras.

**Why not:** cameras aren't game objects; their setup is one-time imperative configuration already doable in a scene's `create` handler, and no meaningful Vue component hierarchy maps to camera ownership.
