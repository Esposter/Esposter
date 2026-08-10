import type { Context } from "@@/server/trpc/context";

// The handle a `db.transaction` callback is given. Drizzle exports no name for it, so it is derived from the
// Method rather than restated as a `PgTransaction<...>` instantiation that drifts from the schema
export type Transaction = Parameters<Parameters<Context["db"]["transaction"]>[0]>[0];
