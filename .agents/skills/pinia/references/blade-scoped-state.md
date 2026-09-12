# Blade-scoped Store State

Read when a component populates a store ref so code outside its subtree can reach it — a bridged editor instance, a staged dialog payload. The rule itself is in `SKILL.md` (whatever a component bridges onto a store, its `onUnmounted` un-bridges); this page is why, and the keyed-route case that makes an unconditional teardown wrong.

Some store refs are populated _by a component_ so code outside its subtree can reach them — a live third-party editor instance bridged for a command bar, a staged payload for a confirm dialog. The store is app-lifetime; that state is not. The component that populates such a ref MUST clear it in `onUnmounted` (back to `undefined`/`""`), or the value outlives its blade: a "current" editor that no longer exists silently satisfying guards, a staged dialog re-opening over a different resource with the previous one's data.

Symmetry rule: whatever a component bridges onto a store in setup/`watchImmediate`, its `onUnmounted` un-bridges.

**A teardown on a keyed route takes an id and checks it first.** A page keyed by an entity id is destroyed and recreated when that id changes, and the successor is mounted — and has already loaded its own state — before the predecessor unmounts. An unconditional `onUnmounted` teardown therefore blanks the state the next page just loaded. Pass the id the component owned (`clearFoo(id)`) and make the action a no-op when the store no longer holds it.
