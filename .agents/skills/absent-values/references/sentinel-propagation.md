# Sentinels Propagate End to End

Read when a sentinel crosses a boundary of our own — a ref into an API input, an input into a row, a row back into a read or into another procedure's input.

A client ref seeded with its sentinel (`""`, `0`, first enum value) always sends the field, so the API input declares it **required** with the sentinel in its value space — never `.partial()`/`.optional()`/`.default()` machinery or `?? undefined` normalisation at the call site. The server truthiness-guards (`if (type) ...`). Minimal code: one value space from ref to query.

- Plain `string` fields already contain `""` — reuse the source schema untouched: `fooSchema.pick({ actorUserId: true })`, non-partial.
- Enum fields union the sentinel: `type: entitySchema.shape.type.or(z.literal(""))`.
- **Numbers use `0`** when `0` has no domain meaning — invite `expireAfterMinutes`/`maxUses`: `0` = never expires / unlimited (`z.literal([...OPTIONS, 0])`, never `.nullable()`).
- **The DB schema itself carries the sentinel** so it flows ref → input → row → read untouched — the column-level rules are `references/sentinel-columns.md`.
- Reserve `.default("")` for fields genuinely omitted by some callers (e.g. `cursor` on the first page request).
- **A stored sentinel is dropped by truthiness before it becomes another procedure's key.** A field whose value space is `""` or a real key (`replyRowKey`) is read back into an input that takes real keys only (`readMessagesByRowKeys`'s `rowKeys`), so the read keeps `flatMap((value) => (value ? [value] : []))` — never `.filter((value) => value !== undefined)`, which lets the sentinel through to a schema that rejects it.
- **A key the sentinel must never reach is branded, so the typecheck drops it rather than review.** `reverseTickedTimestampSchema` carries `.brand<"ReverseTickedTimestamp", "inout">()` — `"inout"` so a tRPC caller's input is branded as well as the parsed output — and every rowKey it backs is declared `ReverseTickedTimestamp`, with a field that may be empty declared `"" | ReverseTickedTimestamp` (`replyRowKey`, a thread root, a dialog's target ref). A plain `string` or `""` handed where a rowKey is required is then a type error, the filter above included. A value is branded only by `getReverseTickedTimestamp` or by parsing it: a route param or a stored key is `safeParse`d at its boundary and read as absent when it fails, and a test writes `getReverseTickedTimestamp()`, never a uuid. The type is `z.infer` of the schema, since a branded schema cannot satisfy a hand-written one.
