# Duplicate Mutation Blocks

Read when the same mutation block — lookup, guard, finalizer, mutate — repeats across siblings, especially over a discriminated-union input.

The same mutation block (lookup + guard + `withFinalizerAsync` + `$trpc.x.mutate`) copy-pasted across siblings differing only in payload → extract a composable that owns the store/`$trpc`/finalizer setup.

When the input is a **discriminated union**, don't type the param `Except<Input, "field">` and spread `{ ...input, field }` — that won't narrow back to the union (TS error, tempts `as`). Take a **builder** `(field) => Input` so each caller builds a complete union member and the literal is checked against the union per call site.
