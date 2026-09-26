# Colocated types

Read when a type has exactly one consumer and that consumer is its own service or composable — a hook map interface, a composable's options, context or emit type. The rule that every other `interface` or `type` is its own `models/` file is in `SKILL.md`; this page is the two colocation exceptions and where each ends.

**Colocate single-use event/hook map types** — when an event/hook map interface (`FooHookMap`, `BarHookMap`) is imported only by its own service file (which creates the singleton), define the interface in that service file rather than a separate `models/` file; consumers import the instance, not the type. Does **not** apply to general type maps (`FooTypeMap`, `BarTypeMap`) — those stay in `models/` regardless of consumer count.

**A composable's own parameter shape colocates with it** — an `Use<Name>Options`, a context or an emit type that exists only to name what that composable takes reads as part of its signature, and every consumer imports the two together. It moves to `models/` the moment something other than that composable's own callers names it. This is the Zod colocation exception applied to a signature rather than a schema.

## Where a type lives

- **An `interface` or `type` lives in its own file under `models/` (`app/models/<feature>/` app-local, `shared/models/<feature>/` cross-package), never beside the code that reads it** — a service, store, constant file or `.vue` component declares no type of its own; an options bag, a return shape or a resource contract is a model file the reader imports, so the next reader finds it where every other shape is. The local declarations are exactly three exceptions (a Zod schema's type, and a single-use hook map or a composable's own parameter shape, which is its options, context or emit type) plus an SFC's `Props` (the `vue` skill) and a test file's fixture shapes, and those sit together at the top of the block after the imports (and macros), before the runtime `const`/logic — never interleaved between logic blocks.
