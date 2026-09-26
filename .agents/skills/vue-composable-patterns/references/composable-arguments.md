# Composable Arguments

Read when choosing how a composable takes a value — a `MaybeRefOrGetter`, a getter, or a plain argument on the function it returns.

Use `MaybeRefOrGetter<T>` when the composable **internally reacts** to the value (reads it inside a `computed`/`watch`) — it must observe changes between calls. Unwrap with `toValue()`, suffixing the unwrapped value with `Value` (`const limitValue = toValue(limit)`). Callers pass a getter to stay reactive to prop changes.

Use a plain **function argument** on the returned function when the value is a **pass-through** evaluated at call time, with no internal reactive dependency. An optional extra argument covers the edit-vs-create split (a validation composable taking the entity's own current name so it validates against itself).

- A composable whose only reads happen inside an explicitly-invoked action (`refresh`, `save`) takes a plain getter or plain args — never refs it doesn't watch. Unwatched ref parameters advertise reactivity that doesn't exist, and the caller ends up re-adding its own watch anyway.
- Vue auto-unwraps computed refs in templates, so `:rules="[someRule]"` passes the function value correctly.
