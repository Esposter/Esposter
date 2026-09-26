# Selection State

Read when a component tree has a selected item.

When a component tree has a "selected item" concept, the selected **id** is store state — not a local ref threaded down as a prop. Store mutations then own the selection directly (a read initializes it, a create auto-selects it via `onSuccess`), so no component emits or watches are needed.

`""` is the "nothing selected" sentinel and the computed resolves to `undefined` when absent — a stale id is harmless. The sentinel rule (and the `useDataMap(..., "")` form) is owned by the `typescript` skill; `| null` is not an option. The component-side consequences — reading the selection straight from the store instead of prop threading, and `:key` instead of a reset watch — are in the `vue-component-patterns` skill.
