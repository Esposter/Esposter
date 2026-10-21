# Screens over the world

Read when a screen opens over the world, or a fixed-step loop or clock must stand still while one is open.

The one-line rule is in `SKILL.md`; this page is its reasoning.

- **A screen over the world is a `ScreenKind`.** Its effect on the world is its `ScreenBehaviourMap` row, its shortcut an `InputActionScreenKindMap` entry, and its component a slot of `MenuScreen` named by its kind, which the world screen fills with what the screen needs; a kind with no slot opens as a placeholder. A talk (`ScreenKind.Dialogue`) is the exception, which `openspec/specs/genshin/screens/design.md` states. Every fixed-step loop and clock in the world stands still while the open screen's `isHeld`, through an `isHeld` prop (`openspec/specs/genshin/screens/design.md`).
