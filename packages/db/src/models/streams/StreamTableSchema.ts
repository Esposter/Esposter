import type { StreamTable } from "@esposter/db-schema";
import type { createStreamTable } from "@esposter/db-schema";

// The table a client reads and writes, whichever member it was given
export type StreamTableSchema = ReturnType<typeof createStreamTable<StreamTable>>;
