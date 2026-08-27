# Exported Schema Consts Under `--isolatedDeclarations`

`--isolatedDeclarations` is on for `packages/*` libraries — not the app, and `db-schema` opts out via `isolatedDeclarations: false`. There, **annotate the concrete `z.ZodObject<{...}>` shape AND keep `satisfies`**.

**Never shortcut with `: z.ZodType<T>`** — it erases the shape, so the built `dist/*.d.ts` exposes no `.shape` and consumers spreading `...someSchema.shape` break against the published package.

**The annotation is always required for an exported schema const** — `tsc` cannot emit a `z.object({...})` expression's type without the checker, so even an all-primitive object fails with TS9010/9013 (verified). There is no "simple schema needs no annotation" exception.

```typescript
export const itemMetadataSchema: z.ZodObject<{
  createdAt: z.ZodDate;
  deletedAt: z.ZodNullable<z.ZodDate>;
}> = z.object({ createdAt: z.date(), deletedAt: z.date().nullable() }) satisfies z.ZodType<ItemMetadata>;
```

Annotation pins a portable shape (`.shape` survives emit); `satisfies` still enforces interface conformance.

- Match each field's zod type exactly: `z.array(x)` → `z.ZodArray<typeof x>`; `z.enum(MyEnum)` → `z.ZodEnum<typeof MyEnum>`; `z.strictObject` carries a second `z.core.$strict` config param; reference an imported or `.pick()`-ed sub-schema via `typeof`, extracting an inline `.pick()` to a local `const` first.
- Annotate unions/enums with their concrete type too (`z.ZodDiscriminatedUnion<...>`, `z.ZodEnum<...>`), never `z.ZodType<T>`.
- **To discover the exact type to write**, temporarily assign the schema to `const _: null = mySchema;` and run the package's `typecheck` — the `TS2322` error prints the full inferred `ZodObject<...>` type verbatim; paste it into the annotation and delete the probe.
- Refinements don't change the annotation — `z.int()` stays `z.ZodNumber`, and `.nonnegative()`/`.positive()` are annotation-safe, so tightening constraints in a library needs no annotation edit (still verify with the package's `typecheck`).
- In the **app** and **db-schema** (no `--isolatedDeclarations`), keep plain `satisfies z.ZodType<T>` — inference emits the full `ZodObject`.
