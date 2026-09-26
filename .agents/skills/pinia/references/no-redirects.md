# No Redirected Store Functions

Read when a composable or a helper is about to re-expose a store function, or a store's type parameter tempts keeping it a composable.

A store function is defined **once** and consumed directly at every use site by destructuring it from the store. Never a layer that only forwards to it — a composable returning `{ foo: store.foo }`, a one-line wrapper, a chain of pass-throughs collapsing to the last function — which is the `over-engineering` skill's first entry and, in its decidable half, `pass-through-helper/no-forwarding-wrapper`.

A composable earns its place **only** when it adds genuine reused behaviour — shared reactive state, multi-step logic, resource lifecycle (`onScopeDispose`), a computed projection — not to re-expose a store's existing API under a new name. Same principle as the mutation-placement rule (`references/mutation-actions.md`): don't add an indirection that carries no logic.

**A store cannot be generic, so a type parameter shared by only part of the state is not a reason to keep the whole thing a composable.** Split it: the members whose shape genuinely depends on the parameter take it themselves (a generic _method_, `readContent<ResourceType.Sheet>(applyContent)`, survives `defineStore` unchanged), and everything identical across parameters becomes plain store state that every surface reads.
