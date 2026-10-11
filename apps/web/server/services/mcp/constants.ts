// The key the agent conversion stamps on a `z.unknown()` or `z.any()`, whose JSON Schema is otherwise `{}`, so the
// Agent and every walk over the schema can tell where it stops describing
export const OPAQUE_KEY = "x-opaque";
