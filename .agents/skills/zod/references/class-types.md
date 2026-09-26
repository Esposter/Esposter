# Schemas for Class Types

Read when a schema's output is plain objects but the interface it satisfies holds class instances.

- **`satisfies z.ZodType<T>` with class types** — when schema output is plain objects but the interface uses class instances (with `toJSON`), use `Except` + `ToData` to strip `toJSON` from nested classes:
