# Sentinels Propagate End to End

Read when a sentinel crosses a boundary of our own — a ref into an API input, an input into a row, a row back into a read or into another procedure's input.

A client ref seeded with its sentinel (`""`, `0`, first enum value) always sends the field, so the API input declares it **required** with the sentinel in its value space — never `.partial()`/`.optional()`/`.default()` machinery or `?? undefined` normalisation at the call site. The server truthiness-guards (`if (type) ...`). Minimal code: one value space from ref to query.

- Plain `string` fields already contain `""` — reuse the source schema untouched: `fooSchema.pick({ actorUserId: true })`, non-partial.
- Enum fields union the sentinel: `type: entitySchema.shape.type.or(z.literal(""))`.
- **Numbers use `0`** when `0` has no domain meaning — invite `expireAfterMinutes`/`maxUses`: `0` = never expires / unlimited (`z.literal([...OPTIONS, 0])`, never `.nullable()`).
- **The DB schema itself carries the sentinel** so it flows ref → input → row → read untouched — the column-level rules are `references/sentinel-columns.md`.
- Reserve `.default("")` for fields genuinely omitted by some callers (e.g. `cursor` on the first page request).
- **A stored absence is dropped before it becomes another procedure's key.** A reply's root is `replyToId`, which is `null` for a message that replies to nothing, and `readMessagesByIds` takes real ids only (`messageIds`, unique message ids). So the read checks for `null` first, as `readThreadRootUserId` does in `apps/web/server/services/message/createUserMessage.ts`, and never hands the field to the input, which would reject it.
- **A key the sentinel must never reach is branded, so the typecheck drops it rather than review.** A schema carries `.brand<"Name", "inout">()` — `"inout"` so a tRPC caller's input is branded as well as the parsed output — and every key it backs is declared with that brand, with a field that may be empty declared `"" | Name`. A plain `string` or `""` handed where the branded key is required is then a type error. A value is branded only by its constructor or by parsing it: a route param or a stored key is `safeParse`d at its boundary and read as absent when it fails, and a test builds the value through the constructor, never a literal. No live key carries a brand today, since a message's id is a plain integer, so a new brand is added when a sentinel can reach a key that must never hold one. The type is a plain alias of the schema's `z.infer` (the `zod` skill's `SKILL.md`, interface-first rule).
