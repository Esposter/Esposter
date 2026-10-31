# External Event / Boundary Payloads — Validate, Never Cast

Read when untyped runtime data enters the program and something is about to be assumed about its shape.

Runtime data crossing any trust boundary — EventGrid `event.data`, Storage Queue messages, webhook bodies, **subprocess stdout, and committed config files** — is untyped. **Never** assert with `x as unknown as SomeType` or hand-roll type guards + casts (`as Record<string, unknown>`, `Object.values(E) as string[]`); a malformed payload then throws deep in the handler instead of at the edge. Define a co-located Zod schema and `.parse()` at the boundary.

For untrusted JSON that arrives as a string (subprocess output, file contents), parse + validate in **one** `getResult`/`getResultAsync` and wrap the failure in `InvalidOperationError(Operation.Read, fn.name, …)` so malformed JSON and a schema mismatch surface identically at the call site. Use `z.strictObject` for closed configs so an unknown key (a typo) fails loud rather than being silently stripped.

```ts
// schema co-located next to the interface, parsed at the boundary — never `event.data as unknown as T`
export interface FooEventGridData {
  foo: Pick<FooEntity, "partitionKey" | "rowKey" | "userId">;
  options: { bar?: null | string; baz?: null | string };
}
export const fooEventGridDataSchema = z.object({
  foo: fooEntitySchema.pick({ partitionKey: true, rowKey: true, userId: true }),
  options: z.object({ bar: z.string().nullish(), baz: z.string().nullish() }),
}) satisfies z.ZodType<FooEventGridData>;
```

Rules:

- **Co-locate the schema with the interface** — `*EventGridDataSchema` in the same file as `*EventGridData`, `satisfies z.ZodType<TheInterface>`. After adding a `@esposter/db-schema` file, run `pnpm build` there so the generated barrel carries it.
- **Compose from existing schemas** — `.pick()` from the existing entity/select schema and reuse the published payload schema. Never hand-rewrite existing field validators.
- **`.parse()` as the first line inside `getResultAsync(async () => { ... })`** (matching the handler pattern) so a validation failure flows through the handler's fatal `logAndRethrow` path (the `error-handling` skill, `references/azure-functions.md`) instead of throwing synchronously outside it. Let the parsed value's inferred type flow downstream — drop the redundant `import type { *EventGridData }`.
- **Parse a value once, at its door, and pass the result down.** A second `.parse` of the same input is either a view the first schema could have kept (a loose envelope retains the keys a strict one strips, so one parse serves a replay that republishes five fields and quarantines the whole event) or a different value (a transform's output, a clone's rewrite), which the door parses because it is the door. A second pass over the same value stays only with a comment naming what the first could not carry. Nothing enforces it: it is dataflow, the same value reaching two parses, which no syntactic rule sees without flagging the second pass of a value that changed.
- **`.nullish()` is allowed here** — the `absent-values` skill's `.nullable()` ban does not reach an external boundary's own shape. An EventGrid payload's optional fields arrive as `null | string`, so `z.string().nullish()` is correct.
- When the schema is an exported const in a `packages/*` library, it also needs an explicit type annotation — `references/isolated-declarations.md`.
