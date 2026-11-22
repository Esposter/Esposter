# Arrays

Read when a schema holds an array.

**Never call `.array()` directly** unless duplicates are genuinely valid. Use `createUniquePrimitiveArraySchema(schema)` for an array of primitives, and `createUniqueArraySchema(schema, key)` for an array of objects, both from `@esposter/shared` — each wraps `.array()` with a uniqueness refine, and all chaining (`.min()`, `.max()`, `.nullable()`, `.optional()`, `.default()`) works identically after (Zod 4's `.refine()` returns the same `ZodArray` type). An array of objects passes the uniquely-identifying field name as the second argument, and an array of primitives takes no key, so an object schema with no key is a type error:

```ts
createUniquePrimitiveArraySchema(z.string()).max(MAX_READ_LIMIT); // not z.string().array()
createUniqueArraySchema(fooSchema, "id").max(FOO_MAX_LENGTH).default([]);
```

**Exception — duplicates are valid:** use plain `.array()` when the array semantically allows duplicates (positional DOM bounds, the same config at different values, ordered content blocks). Don't add an artificial `id` field just to force uniqueness.
