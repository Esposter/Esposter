# Unused Bindings

Read when a parameter or a loop binding is never read.

- **Unused params keep the `_` prefix _and_ a readable name** — `_event`, `_index`, never bare `_`. The prefix satisfies lint; the name documents the slot. Applies to inlined handlers too: `@select="(_event, item) => {...}"`. A **loop** binding nothing reads is the one place bare `_` stands (`for await (const _ of glob(…)) return true`): `no-underscore-dangle` allows the prefix on a parameter only, so a `_match` declarator is a lint error there
