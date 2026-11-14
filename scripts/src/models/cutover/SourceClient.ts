import type { createSourceClient } from "#src/services/cutover/postgres/createSourceClient";

// The read-only connection to the old estate's Postgres every step reads it through
export type SourceClient = ReturnType<typeof createSourceClient>;
