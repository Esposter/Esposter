import { sql } from "drizzle-orm";

// Epoch milliseconds for a timestamp column, written by an insert from a select. That insert binds its values as they
// Are, so the column encodes nothing, and the number is what the column stores (`mode: "timestamp_ms"`). The parameter
// Is a number so a Date handed in is refused rather than bound as an object, and the Date the select field is typed as
// Is the one the column reads back. The metadata pair binds through its column instead, in getInsertSelectMetadata
export const epochMsSql = (epochMs: number) => sql<Date>`${epochMs}`;
