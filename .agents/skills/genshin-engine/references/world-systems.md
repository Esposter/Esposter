# World systems

Read when a world system is added, or one system reacts to another.

The one-line rule is in `SKILL.md`; this page is its reasoning.

Each system of `WorldScreen` is one `use<System>` composable under `composables/`, and a cross-system reaction goes through `WorldEventMap` on the screen's one `WorldEvents`, never a call into another system's state (`openspec/specs/genshin/engine-architecture/design.md`).
