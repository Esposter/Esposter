# String normalization

Read when a string field is trimmed, lowercased or otherwise normalised before validation — which shared helper builds the chain, and where the constraints sit when one is written by hand. The rule (`.transform(fn).pipe(refined)`, constraints on the final pipe) is in `SKILL.md`.

When normalizing a string (trim, lowercase, etc.) before further validation, use `.transform(fn).pipe(refinedSchema)`. Never `.overwrite()` — inconsistent with the codebase.

**Reach for a shared helper before writing the chain by hand**, and the choice between the two is only whether the field may be empty:

| Helper                                    | From                  | Emits                               | Use for                                    |
| ----------------------------------------- | --------------------- | ----------------------------------- | ------------------------------------------ |
| `createNameSchema(maxLength)`             | `@esposter/db-schema` | `.min(1).max(maxLength)` after trim | a field that must carry something — a name |
| `createNormalizedStringSchema(maxLength)` | `@esposter/shared`    | `.max(maxLength)` after trim        | optional prose — a topic, a reason, a note |

Which is which is the whole decision, and it is why hand-rolled copies keep appearing: someone who cannot recall whether the helper forces `min(1)` writes the pipe out instead. If the field has an empty-string default or is `.optional()`, it is the second one.

```typescript
z.string().transform(normalizeString).pipe(z.string().min(1).max(MAX));
z.string()
  .transform((v) => normalizeString(v).toLowerCase())
  .pipe(z.string().min(1).max(MAX));
```

**Consolidate all string constraints (`min`, `max`, `regex`, …) on the single final `.pipe()` output** — never nest pipes when JSON schema output matters. `z.toJSONSchema` / `zodToJsonSchema` run with `io = "output"`: for any `ZodPipe(A, B)` they use `B` and **silently drop constraints on `A`**, so `createNormalizedStringSchema(maxLength, base).pipe(z.string().min(1))` emits `{ minLength: 1 }` with the `maxLength` missing. A helper that nests pipe layers silently drops the constraints declared on the inner ones.
