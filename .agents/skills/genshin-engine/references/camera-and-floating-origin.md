# Camera and floating origin

Read when a frame callback moves the camera, or the character's body is placed against the world's ground and its colliders.

The one-line rule is in `SKILL.md`; this page is its reasoning.

- **What moves the camera runs ahead of the floating origin by priority, and the body moves in the world's own coordinates.** A frame callback that moves the camera registers at `CAMERA_FRAME_PRIORITY`, so the origin's shift reads where the camera now stands whatever order its component mounts in. The character's body moves in the world's own coordinates against the world's one ground (`getGroundHeight`, which the session builds with `createWorldHeight` from Windrise's ground its gate read and each region's as it arrives) and the landmark collider, never shifted, and what is drawn on it stands in the world group (`openspec/specs/genshin/character-controller/design.md`).
