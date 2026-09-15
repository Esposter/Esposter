# Colocated types

Read when a type has exactly one consumer and that consumer is its own service or composable — a hook map interface, a composable's options, context or emit type. The rule that every other `interface` or `type` is its own `models/` file is in `SKILL.md`; this page is the two colocation exceptions and where each ends.

**Colocate single-use event/hook map types** — when an event/hook map interface (`FooHookMap`, `BarHookMap`) is imported only by its own service file (which creates the singleton), define the interface in that service file rather than a separate `models/` file; consumers import the instance, not the type. Does **not** apply to general type maps (`FooTypeMap`, `BarTypeMap`) — those stay in `models/` regardless of consumer count.

**A composable's own parameter shape colocates with it** — an `Use<Name>Options`, a context or an emit type that exists only to name what that composable takes reads as part of its signature, and every consumer imports the two together. It moves to `models/` the moment something other than that composable's own callers names it. This is the Zod colocation exception applied to a signature rather than a schema.
