# One value set

## Why

A closed set of named values is declared two ways. Most are TypeScript `enum`s; the files Node's type stripping loads with no transform (the Nuxt configuration's and modules' graphs, the Claude Code plugins' hooks and commands) cannot hold an `enum`, so they declare an `as const` object instead, and the typescript skill carries a list of where each form is allowed. Sets that share one namespace are combined by `mergeObjectsStrict`, whose name promises a check it does not make: at runtime it is `Object.assign`, so a repeated key silently wins, and its type compares each set only with its neighbour, so the first and third of three sets can collide unreported. The clicker spec states the merge "fails the build on id collisions", which is not true. Declaring a set of values is a solved problem in the language, so every set in the repository takes the one form that runs everywhere, and the one merge is made to do what it says.

## What Changes

- **BREAKING** Every `enum` becomes an `as const` object with a type of the same name. Call sites keep reading `ThemeMode.Dark`; a member used as a type is written `typeof ThemeMode.Dark`.
- **BREAKING** `erasableSyntaxOnly` is on in the shared TypeScript base, so the compiler refuses an `enum`, and the list of places allowed the `as const` form is gone, because every place is.
- `mergeObjectsStrict` refuses a key two sets share, comparing every pair in its type and throwing at load when one repeats.
- The generators that write sets (`createValueSetString` and its callers) write the same form.
- The dungeons' asset key merges leave with the generated `FileKey` (the `migrate-assets` branch); every other merge stays a merge, now checked.

## Capabilities

### New Capabilities

- `value-sets`: how a closed set of named values is declared, composed and checked across the repository.

## Impact

Every package and app: every `enum` declaration and every member a type names. `packages/configuration/tsconfig.base.json`, `packages/shared`'s merge and its type, the set generators under `apps/web/scripts`, the enum-naming and literal-union lint rules and the typescript skill's enum reference. The clicker spec's claim about the merge is corrected.
