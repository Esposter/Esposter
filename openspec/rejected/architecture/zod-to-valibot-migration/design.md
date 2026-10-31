# Zod to Valibot migration

Moving every schema in the repository from Zod to Valibot, along with the JSON Schema step the schema forms depend on and the Drizzle schema builders, is rejected: the gain is bundle size and type-check time that nothing here has measured, and the price is one change across every package.

## Why not

**The gain is unmeasured here, and it shrinks with scale.** Valibot's size comparison is its own, taken on a two-field login form, and its speed comparison names no schemas or environment; by those same figures Valibot and Zod 4 run at a similar speed. Zod pays for its core once, while Valibot pays for each action a bundle uses, so across this many schemas the difference narrows by an amount nobody has measured. Nothing in the repository measures what either library costs the compiler across these schemas either, so the type-check gain, the other one claimed, is a guess too.

**The Drizzle layer has nothing to delete and a few things to lose.** `createSelectSchema` already comes from the `drizzle-orm` package itself, so no validator package leaves the tree, and Drizzle has stopped maintaining the separate ones. Its Valibot generator carries no `coerce` option and no schema factory, which its Zod generator does, and it takes only Valibot schemas as refinements. The helpers every table passes in (`createUniqueArraySchema`, `createNormalizedStringSchema` and `createNameSchema`) would have to be rewritten before any table could move.

**The schema forms lean on what Zod ships.** The form pipeline turns a schema into JSON Schema with `z.toJSONSchema` and reads the typed `layout` metadata the app declares on `GlobalMeta`. Zod copies every metadata field into that output and takes a pipe's output side. Valibot's converter is a separate package whose guide lists transformations as unsupported, and the repository normalizes strings with a transform piped into a refined schema in every form. The metadata would be rebuilt as actions, and whether the converter keeps a normalized field's constraints would have to be proven field by field.

**Zod stays installed regardless.** The Claude Agent SDK, which the agent console depends on, declares Zod as a peer dependency, so the tree would hold both validators and the migration would remove neither.

**There is no incremental path.** A Zod schema cannot sit inside a Valibot object or the reverse, so the `.shape` spreads and `satisfies z.ZodType<T>` declarations that compose the models cannot straddle the two, and the no-compatibility-debt skill refuses to keep an old form beside its replacement. The move would be one change across every package at once, and it would break the public types of the published packages that expose Zod schemas.

## Sources

- [Valibot comparison](https://valibot.dev/guides/comparison/) — Valibot: the size and speed figures, taken on a login form and unnamed runtime inputs.
- [Valibot JSON Schema guide](https://valibot.dev/guides/json-schema/) — Valibot: transformations listed as unsupported by the converter.
- [Zod JSON Schema](https://zod.dev/json-schema) — Zod: metadata copied into the output, and the output side taken for a pipe.
- [Drizzle v1.0.0-beta.15 release notes](https://github.com/drizzle-team/drizzle-orm/releases/tag/v1.0.0-beta.15) — Drizzle: the separate validator packages folded into `drizzle-orm`.
- [Claude Agent SDK package metadata](https://registry.npmjs.org/@anthropic-ai/claude-agent-sdk/latest) — npm: the SDK's peer dependency on Zod.
