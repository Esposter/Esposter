# Input

Read when input is read, a key, mouse or pad button is bound, or a touch control writes into the input.

The one-line rule is in `SKILL.md`; this page is its reasoning.

- **One input, read once a frame, bound in one map.** The world screen owns the one `createInput` and reads it on the canvas's `beforeLoop`, ahead of every frame callback, handing the state down as `inputState`; a key, mouse button or pad button is an `InputAction` chord in `InputActionBindingMap`, never a listener of a component's own (`openspec/specs/genshin/controls/design.md`). The touch controls are the one component listening to pointers, and they move nothing themselves: they write into that input through `press`, `release`, `setTouchStick` and `turn` (`openspec/specs/genshin/touch-controls/design.md`).
